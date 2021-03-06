/* eslint-disable max-len */
app.ajax('GET', 'api/notice/videoInfo', '', {}, function(req) {
  const data = JSON.parse(req.responseText).data;
  const notice = app.get('.notice');
  data.forEach(function(ele) {
    const itemWrap = app.createElement('div', {atrs: {className: 'item-wrap'}}, notice);
    const a = app.createElement('a', {atrs: {href: `https://www.youtube.com/watch?v=${ele.yt_id}`, target: '_black'}}, itemWrap);
    app.createElement('img', {atrs: {src: `https://img.youtube.com/vi/${ele.yt_id}/hqdefault.jpg`}}, a);
    const textWrap = app.createElement('div', {atrs: {className: 'text-wrap'}}, itemWrap);
    app.createElement('h4', {atrs: {className: 'title', innerHTML: `${ele.title}`}}, textWrap);
    app.createElement('div', {atrs: {className: 'description', innerHTML: `${ele.subtitle}`}}, textWrap);
    if (ele.tag[0] !== '') app.createElement('div', {atrs: {className: 'tag', innerHTML: `${ele.tag}`}}, textWrap);
    app.createElement('div', {atrs: {className: 'youtuber', innerHTML: `${ele.youtuber}`}}, textWrap);
    app.createElement('div', {atrs: {className: 'line'}}, notice);
  });
});
