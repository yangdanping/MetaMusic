// 单独的js文件也可以共享对象
// 创建一个全局的audioContext,可以在各个地方使用
const audioContext = wx.createInnerAudioContext();

// audioContext.on()

export { audioContext };
