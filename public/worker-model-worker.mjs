function _0x4ce9(_0x3021c9, _0x574955) {
  const _0x1fccc2 = _0x1fcc();
  return _0x4ce9 = function(_0x4ce971, _0x25f241) {
    _0x4ce971 = _0x4ce971 - 308;
    let _0x14562a = _0x1fccc2[_0x4ce971];
    return _0x14562a;
  }, _0x4ce9(_0x3021c9, _0x574955);
}
const _0x4f4a1e = _0x4ce9;
(function(_0x54a9b9, _0x2d66d6) {
  const _0x270f81 = _0x4ce9, _0x3a419d = _0x54a9b9();
  while (!![]) {
    try {
      const _0x1c715d = parseInt(_0x270f81(341)) / 1 * (parseInt(_0x270f81(318)) / 2) + -parseInt(_0x270f81(336)) / 3 + parseInt(_0x270f81(326)) / 4 + -parseInt(_0x270f81(339)) / 5 * (parseInt(_0x270f81(325)) / 6) + -parseInt(_0x270f81(324)) / 7 + parseInt(_0x270f81(333)) / 8 + parseInt(_0x270f81(330)) / 9;
      if (_0x1c715d === _0x2d66d6) break;
      else _0x3a419d["push"](_0x3a419d["shift"]());
    } catch (_0x26d3f9) {
      _0x3a419d["push"](_0x3a419d["shift"]());
    }
  }
})(_0x1fcc, 628472);
let loadPromise = null;
function _0x1fcc() {
  const _0x536cf4 = ["LOAD_MODELS", "error", "data", "ERROR", "Worker中加载模型失败:", "年12月31日的使用期限", "charCodeAt", "时间检查通过: ", "postMessage", "WORKER_READY", "toDateString", "98JjwLQR", "seg_fast", "modelName", "模型加载已过期，当前日期 ", "buffer", "seg_normal", "1095451TWmFJq", "78954mVuYTn", "1975936bmFxPI", "./models.esm.js", "getFullYear", "length", "2265543vRIHlQ", "MODELS_LOADED", "Worker错误:", "2240560gfIFHh", "未知消息类型: ", "message", "1018866YwaAKR", "Worker初始化失败:", "Worker: 开始加载模型...", "5UIdZzd", "log", "2285aFNYWe"];
  _0x1fcc = function() {
    return _0x536cf4;
  };
  return _0x1fcc();
}
function checkTimeLimit() {
  const _0x391131 = _0x4ce9, _0x29f6b6 = /* @__PURE__ */ new Date(), _0x3de4cd = _0x29f6b6[_0x391131(328)](), _0x1ef141 = new Date(_0x3de4cd, 12, 31);
  if (_0x29f6b6 > _0x1ef141) throw new Error(_0x391131(321) + _0x29f6b6[_0x391131(317)]() + " 超过了 " + _0x3de4cd + _0x391131(312));
  console[_0x391131(340)](_0x391131(314) + _0x29f6b6[_0x391131(317)]());
}
const base64ToArrayBuffer = (_0x1c7864) => {
  const _0x5698c8 = _0x4ce9, _0x5b34c1 = atob(_0x1c7864), _0x2b8b9f = _0x5b34c1[_0x5698c8(329)], _0x2192bf = new Uint8Array(_0x2b8b9f);
  for (let _0x55b946 = 0; _0x55b946 < _0x2b8b9f; _0x55b946++) {
    _0x2192bf[_0x55b946] = _0x5b34c1[_0x5698c8(313)](_0x55b946);
  }
  return _0x2192bf[_0x5698c8(322)];
};
async function loadModelsAsync(_0x3223fd) {
  if (loadPromise) return loadPromise;
  return loadPromise = (async () => {
    const _0x57f86d = _0x4ce9;
    try {
      checkTimeLimit(), console[_0x57f86d(340)](_0x57f86d(338));
      const _0x513474 = await import(_0x57f86d(327));
      let _0x9cfbcc;
      if (_0x3223fd === "seg_fast") _0x9cfbcc = base64ToArrayBuffer(_0x513474[_0x57f86d(319)]);
      else _0x3223fd === _0x57f86d(323) && (_0x9cfbcc = base64ToArrayBuffer(_0x513474[_0x57f86d(323)]));
      return console["log"]("Worker: 模型加载完成"), loadPromise = null, _0x9cfbcc;
    } catch (_0x3510bf) {
      console["error"](_0x57f86d(311), _0x3510bf), loadPromise = null;
      throw _0x3510bf;
    }
  })(), loadPromise;
}
self["onmessage"] = async function(_0x2225e4) {
  const _0x30fccd = _0x4ce9, { type: _0x46546d, data: _0x478411 } = _0x2225e4[_0x30fccd(309)];
  try {
    switch (_0x46546d) {
      case _0x30fccd(342):
        const _0xc182bf = _0x478411[_0x30fccd(320)], _0x3412f7 = await loadModelsAsync(_0xc182bf);
        self[_0x30fccd(315)]({ "type": _0x30fccd(331), "data": { "success": !![], "model": _0x3412f7 } }, [_0x3412f7]);
        break;
      default:
        throw new Error(_0x30fccd(334) + _0x46546d);
    }
  } catch (_0x83f0cd) {
    console[_0x30fccd(308)](_0x30fccd(332), _0x83f0cd), self[_0x30fccd(315)]({ "type": _0x30fccd(310), "data": { "success": ![], "error": _0x83f0cd[_0x30fccd(335)] } });
  }
};
try {
  self[_0x4f4a1e(315)]({ "type": _0x4f4a1e(316), "data": { "success": !![] } });
} catch (_0x1f7321) {
  console[_0x4f4a1e(308)](_0x4f4a1e(337), _0x1f7321), self["postMessage"]({ "type": "WORKER_READY", "data": { "success": ![], "error": _0x1f7321["message"] } });
}
