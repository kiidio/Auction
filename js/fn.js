
$(function(){
   
   //定义全局变量
   var init_change, leaving_time,         //记录前后台倒计时差值
   init_count = '',      //用于校正前后台倒计时时间
   //mobile = (/^1[3|4|5|8][0-9]\d{8}$/.test(get_cookie('u_mobile'))) ? (get_cookie('u_mobile')) : '',  //存储用户绑定的mobile cookie
   now_temp = new Date($('#dataserials').data('nowadays')),   //后台new Date()
   token_user = $('#dataserials').data('open'),
   start = Date.parse($('#dataserials').data('start')) - Date.parse(now_temp),         //判断拍卖是否开始
   last_time = Date.parse($('#dataserials').data('end')) - Date.parse(now_temp),       //判断拍卖是否结束
   pid = $('#dataserials').data('id'),
   ykj_price=$('#dataserials').data('fixedprice');
   
   var flag=1;//判断是否一口价
  
   

      //初始化
        initial();

        //进入页面，初始化函数
        function initial(){
          click_event();   //绑定页面点击事件
          auction_state(start, last_time);   //判断拍卖状态
          update();    //更新界面数据
          setInterval(update, 10000);   //设置定时更新界面数据 
          share();

            //图片轮播
           $('.flexslider').flexslider({
             directionNav: false,
             pauseOnAction: false
            });
        }

        //判断是否是微信浏览器

    function isWeixinBrowser(){
         var ua = navigator.userAgent.toLowerCase();
          return (/micromessenger/.test(ua)) ? true : false ;
     }
     //异常提示
     function sys_err(){
            alert('网络系统异常，请稍后再试!');
          }

    //点击事件
   function click_event(){



          //竞拍价格切换按钮
           $('.circle ').on('fastclick',function(){
            var $dom = $(this);

            if($dom.hasClass('hover')) return;
            $('.hover').addClass('origin');
            $('.hover').removeClass('hover');
            $dom.addClass('hover');
            flag=$dom.hasClass('ykj') ?1:0;
            $(".hammerCnt ").text(($dom.hasClass('ykj') ? ykj_price : $dom.find('p').text())+'拍');
          }); 

          function sys_err(){
            alert('网络系统异常，请稍后再试!');
          }
          //拍卖按钮事件
         $('.hammer').on('fastclick',function(){

          if(!isWeixinBrowser()) 
            {alert("请您复制链接，在微信浏览器中打开");}
        
           //else if(start>0){
              //alert("竞拍还未开始，请您耐心等待");
              //}
         // else if(last_time<0){
             // alert("竞拍已结束，感谢您的关注");
           // }

          else {
               
            $.ajax({
              url:'http://nfyqwx.nfmedia.com/user/authorize?'  + 'openid=' + token_user,
              type: 'get',
              dataType: 'json',
              xhrFields: {
              withCredentials: true
              },
              success:function(res){
                alert(res.errcode);

                if(res){
                   
                    //用户不存在（未授权）
                if(res.errcode == 1){
                       window.location.href='http://nfyqwx.nfmedia.com/user/guideAuth?site=wechat&ref=http://nfyqwx.nfmedia.com/auction/entrance?'+'pid='+pid;
                    //没有联系电话
                }
                else if(res.errcode == 2){
                       window.location.href='http://nfyqwx.nfmedia.com/user/mobile?site=wechat&ref=http://nfyqwx.nfmedia.com/auction/entrance?'+'pid='+pid;
                      
                    //有联系电话
                }
                else if(res.errcode == 3){
                   chujia();
                  
               }
                else {sys_err();}
         
            }
            
          },
          error:function(){sys_err();}

        });
      }
  });


         //微信分享按钮
    
         $('#share ').on('click',function(){
          alert("请点击右上角...分享");});

         function chujia(){
          
          var proprize=$('.prize1').text().split('￥')[1];
         
          var price=flag==1?ykj_price:parseInt($('.hammerCnt').text())+parseInt(proprize);
          
          var $params = {pid: pid, price: price, openid: token_user,site: 'wechat', flag: flag};

         
          

            $.ajax({
              url: 'http://nfyqwx.nfmedia.com/product/price',
              type: 'post',
              dataType: 'json',
              xhrFields: {
                withCredentials: true
              },
              data: $.param($params),
               success: function(data){
                  if(data){
                    alert(data.errcode);
                    if(data.errcode==1){alert("恭喜您，出价成功！");update();}
                    else if(data.errcode==4){alert("您的竞拍为最高价，请等待其他人出价");}
                    else if(data.errcode==5){alert("竞拍成功，您已拍得商品");update();}
                    else if(data.errcode==6){alert("竞拍时间未开始或已结束");}
                    else if(data.errcode==8){alert("请在微信浏览器中打开");}
                    else{alert(data.msg);}

                      }
                    },
                    error:function(){sys_err();}

                  });
                  
          /*$.ajax({

             url:'http://nfyqwx.nfmedia.com/product/price',
             dataType:'json',
             data:JSON.stringify(postdata),
             success: function(data){
                  if(data){
                    alert(data.errcode);
                    if(data.errcode==1){alert("恭喜您，出价成功！");}
                    else if(data.errcode==4){alert("您的竞拍为最高价，请等待其他人出价");}
                    else if(data.errcode==5){alert("竞拍成功，您已拍得商品");}
                    else if(data.errcode==6){alert("竞拍时间未开始或已结束");}
                    else if(data.errcode==8){alert("请在微信浏览器中打开");}
                    else{alert("else");}

                      }
                    },
                    error:function(){sys_err();}

                  });*/
         }


  }

    function share(){

           var url=location.href.split('#')[0];
           
           $.ajax({
             
            url: 'http://nfyqwx.nfmedia.com/user/js/authorize?url='+url,
            type: 'get',
            dataType: 'json',
            success: function(response){
              if(response) {
                wx.config({
                  debug: false, 
                  appId: response.appId,// 必填，公众号的唯一标识
                  timestamp: response.timestamp , // 必填，生成签名的时间戳
                  nonceStr: response.nonceStr , // 必填，生成签名的随机串
                  signature: response.signature,// 必填，签名，见附录1
                  jsApiList: ['onMenuShareTimeline','onMenuShareAppMessage']
                });
                  
              }

            },
            error:function(){sys_err();}
          });

        
        var shareData ={
                title: '喜迎旗下宝懿天猫旗舰店上线与众玩家狂欢0元起拍', // 分享标题
                desc: '老檀匠佛珠-只做收藏级紫檀，为发烧而生', // 分享描述
                link: url, // 分享链接
                imgUrl: 'http://nfyqwx.nfmedia.com/thfb/images/logo.jpg'};// 分享图标;
        wx.onMenuShareAppMessage(shareData);
        wx.onMenuShareTimeline(shareData);
                  

         
   }

  


            //判断拍卖状态
        function auction_state(start_str, last_time_str){
            
          var $hit=$('.time1');
          //竞拍未开始
          if(start_str > 0){  
           $hit.text('离竞拍开始');
           

            count_left_time(start);
           
          //竞拍已结束
          }else{
            if(last_time_str <= 0){
               
              if(init_change) clearInterval(init_change);
              $hit.text('竞拍已结束');
              $('span.hour').text('00');
              $('span.minute').text('00');
              $('span.second').text('00');
          //竞拍正在进行
            }else{
              count_left_time(last_time);
             
            }
          }
        }
          //判断页面倒计时时间与系统倒计时时间差值是否大于2秒，若是，更新页面倒计时时间
          function count_left_time(str){
           

            if(!leaving_time || Math.abs(leaving_time - str) > 2000){
              leaving_time = str;
              init_change_time();
            } 

            //校对前后台倒计时差值
            function change_time(){

              var str_time = count_time(leaving_time);
              $('span.hour').text(str_time[0]);
              $('span.minute').text(str_time[1]);
              $('span.second').text(str_time[2]);
              leaving_time -= 1000;

              if(leaving_time <= 0 && init_change){
                clearInterval(init_change);
              }

              //计算剩余小时、分钟、秒
              function count_time(time){
                var time_hours = change_format(parseInt(time / (60 * 60 * 1000))),
                    
                  time_minutes = change_format(parseInt(time / (60 * 1000)) - time_hours * 60),
                  time_seconds = change_format(parseInt(time / 1000) - time_hours * 60 * 60 - time_minutes * 60),
                  time_str = [time_hours, time_minutes, time_seconds];
                  
                return time_str ;
              }
            }

            //设定或清除校对前后台倒计时差值事件
            function init_change_time(){

              if(init_change){

                clearInterval(init_change);
              }
              init_change = setInterval(change_time, 1000);
            }
                
          }


        //时间格式转换
        function change_format(time){
          if(time < 10){
            time = '0' + time ;
          }
          return time;
        } 
     

     //页面渲染更新
       function update(){
         var  openid = $('#dataserials').data('open') || '';
         


          $.ajax({
            url: 'http://nfyqwx.nfmedia.com/Message/update?pid=' + pid + '&openid=' + openid,
            type: 'get',
            dataType: 'json',
            success: function(response){
              if(response.errcode==1) {
                
                //倒计时刷新
                getLastTime(response.msginfo);
                //出价记录刷新
                auction_list(response.msginfo);
                //当前拍卖价刷新　
                $('.prize1').text('￥'+response.msginfo.current.price);
                //当前出价人数刷新
                $(".total").find('span').html(response.msginfo.current.count);

                
                
              }
              else{alert("异步刷新失败");}

            },
            error:function(){alert('网络系统异常，请稍后再试!');}
          });
           
          //出价记录更新
          function auction_list(res){
           
            
            //出价列表刷新
            var list_html = [];

            res.current.mobilelist.forEach(function(i){
              

              list_html.push("<ul><li>￥" + i.personprice + "</li><li>" + i.mobile + "</li><li>" + i.updatetime + "</li></ul>");
              
            });

            $('div.recordlist').html(list_html.join(''));

            
          }

          //刷新倒计时
          function getLastTime(res){
            var now_time = new Date(res.nowadays);
            last_time = Date.parse(res.endtime) - Date.parse(now_time);
            start = Date.parse(res.starttime)-Date.parse(now_time);
            auction_state(start, last_time);
          }

        }
        
 
})