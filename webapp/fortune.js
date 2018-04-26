//モジュール定義
var http = require('http');
var querystring = require('querystring');
var crypto = require('crypto');

//htmlHeader
var htmlHeader = '<!DOCTYPE html>\
<html lang="ja">\
<head>\
   <meta charset="utf-8">\
   <title>ノード占い</title>\
   <style>\
   </style>\
</head>\
<body>\
<div class="content">\
<h1>ノード占い</h1>';

//htmlMailForm
var htmlMailForm = '<div class ="main-form">\
  <form method = "post" action="/">\
  <div>\
     <label>名前:<input type ="text" name ="name" size = "20"></label>\
  </div>\
  <div>\
     生年月日:\
     <label><input type ="text" name ="year" size = "5">年</label>\
     <label><input type ="text" name ="month" size = "3">月</label>\
     <label><input type ="text" name ="day" size = "3">日</label>\
  </div>\
  <div>\
      性別:\
      <label><input type ="radio" name ="sex" value = "male">男</label>\
      <label><input type ="radio" name ="sex" value = "female">女</label>\
  </div>\
  <input type="submit" value ="占う">\
</form>\
</div>';

//htmlFooter
var htmlFooter = '</div></body></html>';

//escapeChar
function escapeHtmlSpecialChar(html) {
  if(html == undefined) {
    return '';
  } else{
    html = html.replace(/&/g,'&amp;');
    html = html.replace(/</g,'&lt;');
    html = html.replace(/>/g,'&gt;');
    return html;
  }
};

//http.Serverを作成
var server = http.createServer(onRequest);

//function onRequest
function onRequest(request,response){
  //リクエストされたパスが「/」以外の場合、404エラー
  if(request.url != '/') {
    response.writeHead(404,{'Content-Type': 'text-plain; charset=UTF-8'});
    response.end('Error 404: Not Found.');
    return;
  }

  //POST以外のリクエストの場合、メインフォームを送信
  if(request.method != 'POST'){
    response.writeHead(200,{'Content-Type': 'text/html; charset=UTF-8'});
    response.write(htmlHeader);
    response.write(htmlMailForm);
    response.write(htmlFooter);
    response.end();
    return;
  }

  //POSTリクエストの場合、送信されたデータから占い結果を生成する
  if(request.method == 'POST'){
    //送信されたデータを取得する
    request.data = '';
    request.on('data',function(chunk){
      request.data += chunk;
    });
    request.on('end',sendResponse);
    return;
  }

  //データ受信後に実行する
  function sendResponse() {
     var query = querystring.parse(request.data);

     //取得したデータを連結して、MD5ハッシュを計算
     var seed = query.name + query.year + query.month
       + query.day + query.sex;
     hash = crypto.createHash('md5');
     hash.update(seed);
     var hashValue = hash.digest('hex')

  //占い結果を決定
  var fortuneKey = Number('0x' + hashValue.slice(0,2));

  //fortuneKeyによって異なる結果となる
  var result = '';
  if(fortuneKey < 10) {
    result = '大凶';
  }else if(fortuneKey < 50){
    result = '凶';
  }else if(fortuneKey < 100){
    result = '末吉';
  }else if(fortuneKey < 150){
    result = '吉';
  }else if(fortuneKey < 245){
    result = '中吉';
  }else{
    result = '大吉';
  }

  //占い結果を表示
  var resultStr = '<div><p>'
    + escapeHtmlSpecialChar(query.year) + '年'
    + escapeHtmlSpecialChar(query.month) + '月'
    + escapeHtmlSpecialChar(query.day) + '日生まれの'
    + escapeHtmlSpecialChar(query.name) + 'さん('
    + ((query.sex == 'male') ? '男性' : '女性')
    + ')の運勢は......'
    + '<span class="result">'
    + result + '</span>'
    + 'です。</p></div>'
    + '<a href="/">トップに戻る</a>'

    response.writeHead(200,{'Content-Type': 'text/html; charset=UTF8'});
    response.write(htmlHeader);
    response.write(resultStr);
    response.write(htmlFooter);
    response.end();
  }

}



//ポートとアドレス指定
var PORT = 8080;
var ADDRESS = '127.0.0.1';

//指定したポートで待ち受け
server.listen(PORT,ADDRESS);
console.log('Server running at http://' + ':' + PORT + '/');
