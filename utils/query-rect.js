export default function (selector) {
  return new Promise((resolve) => {
    const query = wx.createSelectorQuery();
    query.select(selector).boundingClientRect(); //用选择器绑定某个元素/组件
    query.exec((res) => resolve(res)); //绑定后好去执行,拿到该矩形信息
  });
}
