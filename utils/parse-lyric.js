const timeRegExp = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;

export function parseLyric(lyricString) {
  // 用换行符进行切分,返回数组
  const lyricStrings = lyricString.split('\n');
  const lyricInfo = lyricStrings.map((line) => {
    // [00:18.750]Ooh, let's go!
    // 1.获取时间
    const timeResult = timeRegExp.exec(line);
    if (!timeResult) return; //forEach可中用return跳出本次循环，执行下一次循环
    const minute = timeResult[1] * 60 * 1000;
    const second = timeResult[2] * 1000;
    const millsecondTime = timeResult[3];
    const millsecond = millsecondTime * (millsecondTime.length === 2 ? 10 : 1);
    const time = minute + second + millsecond;
    // 2.获取文本
    const text = line.replace(timeRegExp, '');
    return { time, text };
  });
  return lyricInfo;
}
