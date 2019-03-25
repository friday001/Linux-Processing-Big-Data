var exec = require('child_process').exec;
var express=require('express');
var router = express.Router();
var http = require('http');
var url = require('url');
var util = require('util');
var fs = require('fs');
var parse = require('csv-parse');
var async = require('async');
var nodecsv=require('node-csv');
var readLine = require('lei-stream').readLine;
var ws = require("nodejs-websocket");
/* GET home page. */
router.get('/', function(req, res, next) {
 //   res.header('Content-Type', 'text/plain')
 //   res.header('Access-Control-Allow-Origin','*')
  res.render('AutomMLTwo', { title: 'Express' });
});

router.post("/automl",(req, res, next)=> {
       var params=req.body
    console.log(params);
    console.log(params.target);


    var   fe=params["feature"];
    console.log(fe);
    var feat='';
  //  var reg=/[[]/;
    if(fe instanceof Array){
        for(var a=0;a<fe.length;a++){
            console.log(a)
            feat+=fe[a]+" ";
        }
    }else{
        feat=fe;
    }

    console.log(feat);
    var  number_data;
     console.log("--scratch --features_attrib "+feat+" --target "+params.target  +
         " --model_type "+params.modalname);
             exec('python run_boot.py --scratch --features_attrib '+feat+" --target "+params.target
         +" --model_type "+params.modalname,function(error, stdout, stderr){
                 console.log(stdout)
           var data=(stdout.split(':'))[1];
          number_data =(parseFloat(data)*100).toFixed(2);
            console.log("1111:::"+number_data)
                //   console.log(res.client)
                 //res.socket.client.timeout = 500000
                 res.connection.server.timeout = 500000

                 res.send(number_data.toString())
            });
   // res.send('1111')
});

        let hot;
router.get("/CsvData",function (req,res,next) {

    let  hotdata=Array();
    var s=readLine(fs.createReadStream('bank.csv'),{
        newline:'\n',
        autoNext:false,

    });
    s.on('data',function (data) {
     //   console.log(data);
     //   res.send(data);
        if(hotdata.length<10000) {

            hotdata.push(data.split(','));
          //  console.log("hotdata:",hotdata)
            s.next();
        }else {
            res.send({'data':hotdata});
            s.close();
        }

    });
   /* s.on('end',function () {
        hot=hotdata;
        console.log('end')
        //  console.log(hotdata)

    })*/


});

router.get('/handleData',function (req,res,next) {
    res.connection.server.timeout = 5000000;
    var params = url.parse(req.url, true).query;
    var thecol = (+params.col) + 1;
    console.log("thecol:", thecol)
    //var max,min;
    //获取点击的某一列的值
    a();
    function a() {
        exec("sudo gawk -F, '{ print $" + thecol + "}' bank.csv >bankcol" + thecol + ".csv", function (error, stdout, stderr) {
            console.log("jie qu biao");
            b();
            // if(!error){

        });
    }

    //去掉首行
    function b() {
        exec("sed -i '1d' bankcol" + thecol + ".csv", function (error1, stdout1, stderr1) {
            console.log("qu diao de shouhang");
            c();
        });

    }

    function c() {
        exec("sort bankcol" + thecol + ".csv | uniq -c | sort -rn  > bankcolcount" + thecol + ".csv",
            function (error2, stdout2, stderr2) {
                console.log("shu liang tong ji");
                d();
            });

    }

    //数量统计

    function d() {                  //去掉前面空格并按照第二行排序
        exec("sed -i  's/^ *//' bankcolcount" + thecol + ".csv && sort -n -k 2 -t ' '  bankcolcount" + thecol + ".csv -o   bankcolcount" + thecol + ".csv", function (error3, stdout3, stderr3) {
            console.log("qu diao tong ji biao qian mian kong ge bing paixu");
                    e();

        })
    }

    function e() {
                    //获取第二列第一行的元素，判断其是字符串还是数字；  若是不是数字则用最终是饼状图，饼图需要的是
    exec("cat bankcolcount" + thecol + ".csv | awk -F  ' '  'NR==1{print $2}' ", function (error4, stdout4, stderr4) {
        console.log(" stdout4:", stdout4);
        console.log("error4:", error4);
        console.log("stderr4:", stderr4);
        var data_new = Array();
        var number_random = Array();
        var sum_random = Array();
        var reg = /[a-zA-Z]/;
        if (reg.test(stdout4)) {
            var colCountData = readLine(fs.createReadStream('bankcolcount' + thecol + '.csv'), {
                newline: '\n',
                autoNext: false,

            });

            colCountData.on('data', function (data) {
                //   console.log(data);
                //   res.send(data);
                var bigdata = data.split(' ');
                data_new.push({name: bigdata[1], value: (+bigdata[0])});
                colCountData.next();
            });

            colCountData.on('end', function () {

                console.log('end')
                console.log("data_new:", data_new)
                //  console.log(hotdata)
                res.send({'data_new_': data_new, "type_": "pie"});
            })

        } else {
            var min = Array();
            var max = Array();
            var data;
            console.log("000000000:else")//查看文件的行数，有多少条数据
            function exex() {
                exec("wc -l bankcolcount" + thecol + ".csv |awk '{print $1}' ", function (error5, stdout5, stderr5) {
                    console.log("stdout5", stdout5)
                    if (!error5) {
                        console.log("stdout5:", stdout5)
                        data = Math.ceil((+stdout5) / 10);
                        console.log("行数：", data);
                        ex();
                    }
                    //    callback("1")
                });

            }

            function ex() {
                exec("split -l " + data + "  bankcolcount" + thecol + ".csv -d -a 1 bankcolcount_", function (error6, stdout6, stderr6) {
                    if (!error6) {
                        console.log("split ok")
                        ex1();
                        //       callback("2");
                    }
                });
            }
            function ex1() {

              //  var count = 0;

                (async()=>{
                       for(var i=0;i<10;i++){
                           await  getEx1(i);
                           console.log("ex1::",i)
                       }
                })()

                }



            function getEx1(i) {
                return new Promise((res,rej)=>{
                    exec("sed '/^$/d' bankcolcount_" + i + "|awk 'NR==1{min=$2;next}{min=min<$2?min:$2}END{print min}' ",(error7, stdout7, stderr7)=>res([
                        error7,stdout7,stderr7
                    ]))
                }).then((data)=>{
                    let [error,stdout,stderr]=data;
                    console.log("stdout:" + stdout);
                 //   count++;
                    min.push(stdout);
                    if (i == 9) {
                        ex2();
                    }

                })

            }

            function ex2() {

                var count = 0;



                  (async()=>{
                      for (var i = 0; i <10; i++) {
                          await getEx2(i);
                          count++;
                          console.log("count:"+count)
                  }

              } )()
        }

            function getEx2(i){

                return new Promise((res, rej) => {
                    exec("sed '/^$/d' bankcolcount_" + i + "|awk 'NR==1{max=$2;next}{max=max>$2?max:$2}END{print max}'",(error8, stdout8, stderr8)=>res([
                        error8,stdout8,stderr8
                    ]))

                }).then((data) => {
                    let [error,stdout,stderr]=data;

                    console.log("stdout:", stdout)
                    max.push(stdout);
                //    count++;
                    if (i ==9) {
                        ex3();
                    }


                })

            }

            function ex3() {
                var count = 0;


                (async()=>{
                    for(var i=0;i<10;i++){
                        await getEx3(i);
                    }
                })()

            }

        function  getEx3(i) {

            return new Promise((res, rej) => {
                exec("awk '{sum+=$1} END {print sum}'  bankcolcount_" + i,(error9, stdout9, stderr9)=>res([
                    error9,stdout9,stderr9
                ]))
            }).then((data) => {
                let [error,stdout,stderr]=data;
                console.log("i::",i)
                console.log("stdout:", stdout)
                sum_random.push(stdout);
                //    count++;
                if (i ==9) {
                    sendrom();
                }


            })


        }
            function sendrom() {
                console.log("min:",min)
                console.log("max:",max)



                    for (var j = 0; j <10; j++) {
                      number_random.push(min[j] + "~" + max[j]);
                    }



                console.log("number_random_", number_random, "sum_random_", sum_random,)
                res.send({"number_random_": number_random, "sum_random_": sum_random, "type_": "bar"});

            }

            exex();
        }


    });

}


});


router.get('/getPointData',function (req,res,next){
    exec(" head -n 1 ./public/bank.csv>./public/bankshuf.csv &&  cp ./public/bank.csv  ./public/bankdata.csv &&  sed -i '1d' ./public/bankdata.csv",function (error,stdout,stderr) {
        if(error){
            console.log("err to shuf")
        }else {
            exec("shuf -n9999  ./public/bankdata.csv >./public/bankdatarandom.csv &&  cat ./public/bankdatarandom.csv >>./public/bankshuf.csv",function (error1,stdout1,stderr1) {
                if(error1){
                    console.log("bankshuf is err")
                }else {
                    console.log("ok")
                    res.send({"suc":"sucess"})
                }
            })
        }
    })
} );

router.get('/DataQuality',function (req,res,next) {

    getDataNumber();
            var dataNumber;
            var missNumber;
    function getDataNumber() {
        exec("awk -v RS=',' 'END {print --NR}' demo.csv ", function (error, stdout, stderr) {
                    console.log("dataNumber:",stdout)
                    dataNumber=stdout;
                    getMissNumber();
        });
    }

    function getMissNumber(){
        exec("awk -v RS=' ' 'END {print --NR}' demo.csv",function (error1, stdout1, stderr1) {

            missNumber=stdout1;
            console.log("missNumber:",missNumber);
            exfri()

        });
    }


    var name=Array();
    var datahang;
    var thei=Array();
    var dataEveryCol=Array();


    function exfri(){
        exec(" head -n 1 demo.csv",function (error1,stdout1,stderr1) {
            console.log(stdout1)
            console.log(error1)
            console.log(stderr1)
            name=stdout1.split(',');
            datahangshu()

        })
    }

    function datahangshu() {
        //all the data of colnumber
        exec("wc -l demo.csv |awk '{print $1}'",function (error2,stdout2,stderr2) {
            datahang =stdout2;
            getex();
        });
    }




    function getex() {
        var count=0;
        for(var i=1;i<=name.length;i++) {
            exec(" gawk -F, '{ print $" + i + "}' demo.csv > a" + i + ".csv", function (error3, stdout3, stderr3) {
                count++;

                if(count==name.length){
                    getMiss()

                }
            });

        }



    }

    function getMiss() {
        console.log("getmiss")
        var count = 0;
        (async()=>{
            for (var i = 1; i <=name.length; i++) {
                await getM(i);

                console.log("i:"+i)
                count++;
                console.log("count:"+count)

            }

        } )()


    }
    var aa=0;
   function  getM(i) {


        return new Promise((res, rej) => {
           exec("awk -v RS=' ' 'END {print --NR}' a"+i+".csv",(error4, stdout4, stderr4)=>res([
               error4,stdout4,stderr4
           ]))

        }).then((data) => {
            let [error,stdout,stderr]=data;

                      console.log("i::",i)


                     console.log("stdout:",stdout)
                         thei.push(i);
                     dataEveryCol.push(stdout)
            aa++;
                     console.log("aa::",aa)
             if(aa==name.length){

                 console.log(" dataEveryCol:",dataEveryCol)
                 res.send({"dataNumber": dataNumber, "missNumber": missNumber,"dataEveryCol":dataEveryCol,"name":name,"hang":datahang,"thei":thei})
                }
    })
   }

    //  exfri()

});





module.exports = router;
