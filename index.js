const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');

const file = "Songs.txt"

const LINK_YOUTUBE = 'https://www.youtube.com';
const LINK_CONVERT = 'https://dvr.yout.com/mp3';

const cont = 0;

searchVideo();

function getSongs(){
    let data = fs.readFileSync(file,'utf8');
    data = data.split("\r");
    if(data == ''){
        return null;        
    }else{
        return data;
    }
}

function convertWord(item){
    item = item.trim();
    item = item.replace(/\r/g,"");
    item = item.replace(/\n/g,"");
    item = item.replace(/ /g,"+");
    return item;
}

function desconvertWord(item){
    item = item.replace(/\+/g," ");
    return item;
}

function searchVideo(){
    let songs = getSongs();
    let links = [];

    if(songs != null){

        var data = new Date();

        var dia     = data.getDate();           // 1-31
        var mes     = data.getMonth();          // 0-11 (zero=janeiro)
        var ano    = data.getFullYear();       // 4 dígitos
        var hora    = data.getHours();          // 0-23
        var min     = data.getMinutes();        // 0-59

        var str_data = dia + '/' + (mes+1) + '/' + ano;
        var str_hora = hora + ':' + min ;

        fs.appendFile('./Songs/RelatorioSongs.txt',"\n===== > "+songs.length+" Musica(as) (" + str_data +" - " + str_hora + ")\n\n",{enconding:'utf-8'}, function (err) {
            if (err) throw err;
        });


        songs.forEach(function (item,index){
            item = convertWord(item);
            
            request(LINK_YOUTUBE + "/results?search_query=" + item + "&pbj=1", function (erro,response,html){
                if(!erro && response.statusCode == 200){
                    const telaPesquisa = cheerio.load(html);    
                    
                    telaPesquisa('a').each((i,el)=>{
                        const htmlVideo = telaPesquisa(el).attr('href');
                        
                        if(htmlVideo.indexOf('watch') != -1){
                            links.push(htmlVideo);
                        }
                    })

                    checkSong(links[0],item);

                }else{
                    console.log("Deu ruim na pesquisa pelo nome (" + item + ")!!!");gravar('Erro',desconvertWord(item));
                }
            })
        })

    }else{
        console.log("Não tem nenhuma musica para ser baixada !!!");
    }
}
    
function checkSong(htmlVideo,name){

        request(LINK_YOUTUBE + htmlVideo + "&pbj=1", function (erro,response,html){

            if(!erro && response.statusCode == 200){
            const telaVideo = cheerio.load(html);

            const title = convertWord(telaVideo('.watch-title').html());

            if(name == title){
                let url = LINK_YOUTUBE + htmlVideo;
                url = url.replace("youtube","yout");

                downloadSong(url,desconvertWord(name));

            }else{
                console.log("Deu ruim, video errado ... ("+ desconvertWord(name) +")");gravar('Erro',desconvertWord(name));
            }
        }else{
            console.log("Deu ruim na tela de videos !!!");gravar('Erro',desconvertWord(name));
        }
    })
}

function downloadSong(url,name){

    var base64 = new Buffer.from(url.replace("https://www.yout.com/watch?","")).toString('base64');

    var obj = {
        video_id : url.replace("https://www.yout.com/watch?v=",""),
        video_url : 'aHR0cHM6Ly93d3cueW91dHViZS5jb20vd2F0Y2g/'+ base64 ,
        format : 'mp3', // padrão   
        title : name, // nome da musica
        artist : '', // nome do artista 
        start_time : false, // padrão
        end_time : false, // padrão
        thingy : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbF9mb3JfYXBpX2FjY2VzcyI6ImpvaG5AbmFkZXIubXgifQ.YPt3Eb3xKekv2L3KObNqMF25vc2uVCC-aDPIN2vktmA',
        audio_quality : '128k', // padrão
    }
        
    request.post(LINK_CONVERT , { form : obj })
    .on('error', function(err) {
        console.log("Deu ruim, Donwload não funcionou (" + name + ")");
        gravar('Erro',name);
    })
    .pipe(fs.createWriteStream("./Songs/" + name + '.mp3'));
    
    console.log("Fim download (" + name + ")");
    gravar('Baixada',name);

    
}

function gravar(status,name){
    fs.appendFile('./Songs/RelatorioSongs.txt',"( " + status +" ) - " + name + "\n",{enconding:'utf-8'}, function (err) {
        if (err) throw err;
    });
}








