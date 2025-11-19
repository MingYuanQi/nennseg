import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

const App = () => {
  // 状态定义（保持不变）
  const [isActive, setIsActive] = useState(false);
  const [selectedModel, setSelectedModel] = useState('model1');
  const [selectedColor, setSelectedColor] = useState('rgba(0, 255, 255, 0.3)');
  const [selectedBackground, setSelectedBackground] = useState('bg1');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const model = useRef(null);
  const imgRGBA = useRef(null);
  const result = useRef(null);
  
  // 预设选项（保持不变）
  const colorOptions = [
    { id: 'color1', value: 'rgba(0, 255, 255, 0.3)', label: '青色半透明' },
    { id: 'color2', value: 'rgba(255, 105, 180, 0.3)', label: '粉色半透明' }
  ];
  
  const backgroundOptions = [
    { id: 'bg1', url: 'https://picsum.photos/id/1015/800/600', label: '自然风景' },
    { id: 'bg2', url: 'https://picsum.photos/id/1035/800/600', label: '城市建筑' }
  ];
  
  // 新增：组件挂载时自动启动相机
  useEffect(() => {
    // 确保video元素已挂载
    const timer = setTimeout(() => {
      if (videoRef.current) {
        startCamera();
      }
    }, 500); // 微小延迟确保DOM已准备好
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const loadModel = async () => {
      if (selectedModel === "model1") {
           if(model.current)
            return
        try {
          console.log('开始加载模型...');
          
          // 使用绝对路径
          const configUrl = `${window.location.origin}/models/configs.json`;
          console.log('配置文件URL:', configUrl);
          
          const modelUrl = `${window.location.origin}/models/model.onnx`;
          console.log('模型文件URL:', modelUrl);
          
          console.log('开始创建模型实例...');
          if(model.current == null)
            model.current = new window.NennWeb.RSeg(modelUrl, configUrl, { executionProviders: ['webgpu'] }, undefined, undefined, 1);
          console.log('模型实例创建成功');
          
        } catch (error) {
          console.error('模型加载详细错误:', error);
          console.error('错误堆栈:', error.stack);
          alert(`模型加载失败: ${error.message}\n请检查控制台获取详细信息`);
        }
      }
    };
    
    loadModel();
  }, [selectedModel]);
  
  // 获取摄像头权限（保持不变，微调顺序）
  const startCamera = async () => {
    try {
      // 先请求摄像头权限，再设置状态
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 720, height: 480 } 
      });
      
      if (videoRef.current) {
        let h = stream.getVideoTracks()[0].getSettings().height;
        let w = stream.getVideoTracks()[0].getSettings().width;
        videoRef.current.width = w;
        videoRef.current.height = h;
        videoRef.current.srcObject = stream;
        // setIsActive(true);
        // startSegmentation();
      }
    } catch (err) {
      console.error('无法访问摄像头:', err);
      alert('无法访问摄像头，请确保已授予权限\n' + err.message);
    }
  };
  
  // 停止摄像头（保持不变）
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      setIsActive(false);
    }
  };

  const stopSegmentation = async () => {

  }

  const inferVideo = () => {
    if (!videoRef.current || !canvasRef.current) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.width;
      canvas.height = video.height;
      
      try {
        if (selectedModel === "model1" && model.current) {
          if (imgRGBA.current) {
              imgRGBA.current.delete()
          }
          imgRGBA.current = new window.cv.Mat(
            video.height,
            video.width,
            window.cv.CV_8UC4         // 类型：8位无符号整数，4通道（RGBA）
          );

          let cap = new window.cv.VideoCapture(video);
          cap.read(imgRGBA.current)
          inferImage().then(()=>{
              window.cv.imshow(canvas, result.current.blendedImg)
              setTimeout(() => {inferVideo()}, 100);
          })
        }
      } catch (error) {
        console.error('Segmentation error:', error);
      }
  }

  const inferImage = async () => {
      if(result.current){
          result.current.delete()
      }
      result.current = await model.current.infer(imgRGBA.current);
  }
  
  // 开始分割处理
  const startSegmentation = async () => {
      console.log("开始分割...")
      setIsActive(true);
      inferVideo();
  };
  
  // 切换模型时重新启动分割（保持不变）
  useEffect(() => {
    if (isActive) {
      startSegmentation();
    }
  }, [selectedModel, selectedColor, selectedBackground, isActive]);
  
  // 组件卸载时清理（保持不变）
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  // 渲染部分（保持不变）
  return (
    <Container>  
      <ControlPanel>
        <Button onClick={isActive ? stopSegmentation : startSegmentation}>
          {isActive ? '停止' : '开始'}
        </Button>
        
        <ModelSelector>
          <span>选择分割模型:</span>
          <Button 
            variant={selectedModel === 'model1' ? 'selected' : 'default'}
            onClick={() => setSelectedModel('model1')}
            disabled={!isActive}
          >
            模型1
          </Button>
          <Button 
            variant={selectedModel === 'model2' ? 'selected' : 'default'}
            onClick={() => setSelectedModel('model2')}
            disabled={!isActive}
          >
            模型2
          </Button>
        </ModelSelector>
        
        <ColorSelector>
          <span>选择预设颜色:</span>
          {colorOptions.map(color => (
            <ColorButton
              key={color.id}
              style={{ backgroundColor: color.value }}
              className={selectedColor === color.value ? 'selected' : ''}
              onClick={() => setSelectedColor(color.value)}
              disabled={!isActive}
              title={color.label}
            />
          ))}
        </ColorSelector>
        
        <BackgroundSelector>
          <span>选择背景图片:</span>
          {backgroundOptions.map(bg => (
            <BackgroundThumbnail
              key={bg.id}
              src={bg.url}
              className={selectedBackground === bg.id ? 'selected' : ''}
              onClick={() => setSelectedBackground(bg.id)}
              disabled={!isActive}
              alt={bg.label}
            />
          ))}
        </BackgroundSelector>
      </ControlPanel>
      
      <VideoContainer>
        <>
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="hidden-video" 
          />
          {isActive ? <canvas ref={canvasRef} className="result-canvas" />: undefined}
        </>
      </VideoContainer>
    </Container>
  );
};

// 样式组件（保持不变）
const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Arial', sans-serif;
  text-align: center;
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 30px;
`;

const ControlPanel = styled.div`
  background-color: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;
  justify-content: center;
`;

const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
  
  background-color: ${props => 
    props.variant === 'selected' ? '#4CAF50' : 
    props.disabled ? '#cccccc' : '#2196F3'};
  color: white;
  
  &:hover:not(:disabled) {
    background-color: ${props => 
      props.variant === 'selected' ? '#45a049' : '#0b7dda'};
  }
  
  &:disabled {
    cursor: not-allowed;
  }
`;

const ModelSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  
  span {
    color: #666;
    font-weight: 500;
  }
`;

const ColorSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  
  span {
    color: #666;
    font-weight: 500;
  }
`;

const ColorButton = styled.button`
  width: 30px;
  height: 30px;
  border: 2px solid transparent;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &.selected {
    border-color: #333;
    transform: scale(1.2);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const BackgroundSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  
  span {
    color: #666;
    font-weight: 500;
  }
`;

const BackgroundThumbnail = styled.img`
  width: 60px;
  height: 40px;
  object-fit: cover;
  border: 2px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &.selected {
    border-color: #2196F3;
    box-shadow: 0 0 0 2px white, 0 0 0 4px #2196F3;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const VideoContainer = styled.div`
  position: relative;
  width: 720px;
  height: 480;
  margin: 0 auto;
  border: 2px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  .hidden-video {
    display: none;
  }
  .result-canvas {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export default App;