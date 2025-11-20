import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

const App = () => {
  // 状态定义（保持不变）
  const [isActive, setIsActive] = useState(false);
  const [selectedModel, setSelectedModel] = useState('model1');
  const [selectedColor, setSelectedColor] = useState('rgba(255, 255, 255, 1)');
  const [disableBtn, setDisableBtn] = useState(true);
  const [selectedBackground, setSelectedBackground] = useState('bg1');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const model = useRef(null);
  const imgRGBA = useRef(null);
  const result = useRef(null);
  const bgcolor = useRef([255,255,255, 1])
  const bgimg = useRef(null)
  
  // 预设选项（保持不变）
  const colorOptions = [
    { id: 'color1', value: 'rgba(255, 255, 255, 1)', label: '白色' },
    { id: 'color2', value: 'rgba(0, 255, 255, 1)', label: '青色' },
    { id: 'color3', value: 'rgba(255, 105, 180, 1)', label: '粉色' }
  ];
  
  const backgroundOptions = [
    { id: 'bg1', url: '', label: '无' },
    { id: 'bg2', url: 'https://picsum.photos/id/1015/800/600', label: '自然风景' },
    { id: 'bg3', url: 'https://picsum.photos/id/1035/800/600', label: '城市建筑' }
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
      console.log('开始加载模型...hahaha '+ selectedModel);
      model.current = null
      if (selectedModel === "model1") {
        try {
          // 使用绝对路径
          const configUrl = `${window.location.origin}/models/configs.json`;
          
          console.log('开始创建模型实例...');
          if(model.current == null){
             window.NennWeb.getModel("seg_normal").then((modelurl)=>{
                if(modelurl == null)
                  return
                console.log('qweqwe模型实例创建成功');
                model.current = new window.NennWeb.RSeg(modelurl, configUrl)
            })
          }
          
        } catch (error) {
          console.error('模型加载详细错误:', error);
          console.error('错误堆栈:', error.stack);
          alert(`模型加载失败: ${error.message}\n请检查控制台获取详细信息`);
        }
      }else if(selectedModel === "model2") {
        try {    
          // 使用绝对路径
          const configUrl = `${window.location.origin}/models2/configs.json`;
          console.log('配置文件URL:', configUrl);
          
          const modelUrl = `${window.location.origin}/models2/model.onnx`;
          console.log('模型文件URL:', modelUrl);
          
          console.log('开始创建模型实例...');
          if(model.current == null)
             window.NennWeb.getModel("seg_fast").then((modelurl)=>{
                console.log('qweqwe222模型实例创建成功');
                model.current = new window.NennWeb.Seg(modelurl, configUrl)
            })
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
      }
      setDisableBtn(false)
    } catch (err) {
      console.error('无法访问摄像头:', err);
      alert('无法访问摄像头，请确保已授予权限\n' + err.message);
    }
  };

  const stopSegmentation = async () => {
    setIsActive(false);
  }

  const urlToMat = async (url) => {
    return new Promise((resolve, reject) => {
      // 1. 创建Image对象加载图片
      const img = new Image();
      img.crossOrigin = 'anonymous'; // 允许跨域
      img.onload = () => {
        try {
          // 2. 创建Canvas，绘制图片获取像素数据
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0); // 绘制完整图片
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height); // RGBA格式

          // 3. 转换为OpenCV Mat（RGBA→BGR，符合OpenCV默认格式）
          const cv = window.cv; // 从全局获取OpenCV实例
          const rgbaMat = cv.matFromImageData(imageData); // 先转RGBA格式Mat
          const bgrMat = new cv.Mat(); // 最终输出BGR格式Mat（OpenCV常用）
          cv.cvtColor(rgbaMat, bgrMat, cv.COLOR_RGBA2BGR); // 格式转换

          rgbaMat.delete(); // 释放临时Mat，避免内存泄漏
          resolve(bgrMat);
        } catch (err) {
          reject(new Error(`Mat转换失败: ${err.message}`));
        }
      };
      img.onerror = (err) => reject(new Error(`图片加载失败: ${err}`));
      img.src = url;
    });
  };

  const handleConvert = async (imageUrl) => {
      const mat = await urlToMat(imageUrl);
      bgimg.current = mat
  };

  useEffect(()=> {
    for(let i = 0; i < backgroundOptions.length; i++){
      if(backgroundOptions[i].id == selectedBackground){
        if(backgroundOptions[i].url != ""){
          handleConvert(backgroundOptions[i].url)
        }else{
          bgimg.current = null
        }
      }
    }
  }, [selectedBackground])

  const inferVideo = () => {
    if (!videoRef.current || !canvasRef.current) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      try {
        if (model.current) {
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
              setTimeout(() => {inferVideo()}, 0);
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
      result.current = await model.current.infer(imgRGBA.current, bgcolor.current, bgimg.current);
  }

  useEffect(()=>{
    if(canvasRef.current){
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.width;
      canvas.height = video.height;
    }
  },[isActive])

  useEffect(() => {
  // 正则匹配 rgba 括号内的所有数字（支持整数、小数）
  const regex = /rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/;
  const match = selectedColor.match(regex);

  if (match) {
    // 提取匹配结果，转为数字数组（跳过第0项匹配的完整字符串）
    const arr = match.slice(1).map(item => Number(item));
    bgcolor.current = arr
  }
}, [selectedColor]);
  
  // 开始分割处理
  const startSegmentation = async () => {
      setIsActive(true);
      inferVideo(true)
  };
  
  // 切换模型时重新启动分割（保持不变）
  useEffect(() => {
    if (isActive) {
      startSegmentation();
    }
  }, [isActive]);
  
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
        <Button disabled={disableBtn} onClick={isActive ? stopSegmentation : startSegmentation}>
          {isActive ? '停止' : '开始'}
        </Button>
        
        <ModelSelector>
          <span>选择分割模型:</span>
          <Button 
            variant={selectedModel === 'model1' ? 'selected' : 'default'}
            onClick={() => setSelectedModel('model1')}
          >
            模型1
          </Button>
          <Button 
            variant={selectedModel === 'model2' ? 'selected' : 'default'}
            onClick={() => setSelectedModel('model2')}
          >
            轻量模型
          </Button>
        </ModelSelector>
        
        <ColorSelector>
          <span>选择颜色:</span>
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
          <span>背景图片:</span>
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
            className={`${isActive ? 'hidden-video' : ''}`}  
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