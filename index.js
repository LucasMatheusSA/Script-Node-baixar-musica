const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');

const file = "Songs.txt"

LINK_YOUTUBE = 'https://www.youtube.com';

function getSongs(){
    let data = fs.readFileSync(file,'utf8');
    data = data.split("\r");
    return data;
}

function corectString(item){
    item = item.replace("\r","");
    item = item.replace(" ","+");
}

function searchVideo(){
    let songs = getSongs();

    songs.forEach(function (item,index){
        item = item.replace(/\r/g,"");
        item = item.replace(/\n/g,"");
        item = item.replace(/ /g,"+");
        
        request(LINK_YOUTUBE + "/results?search_query=" + item + "&pbj=1", function (erro,response,html){
            if(!erro && response.statusCode == 200){
            const telaPesquisa = cheerio.load(html);
            telaPesquisa('a').each((i,el)=>{
                const htmlVideo = telaPesquisa(el).attr('href');
                if(htmlVideo.indexOf('watch') != -1){
                    downloadSong(htmlVideo,item);
                }
                })
            }else{
                console.log("Deu ruim na pesquisa pelo nome (" + item + ")!!!");
            }
        })
    })
}

function downloadSong(htmlVideo,texto){
    console.log("entrou");
    request(LINK_YOUTUBE + htmlVideo + "&pbj=1", function (erro,response,html){
        if(!erro && response.statusCode == 200){
            const telaVideo = cheerio.load(html);
            telaVideo('yt-formatted-string').each((i,el)=>{
                console.log("entrou1");
                const classTitle = telaVideo(el).attr('class');
                if(classTitle == 'style-scope ytd-video-primary-info-renderer'){
                    if(true){
                        console.log("aqqqqq");
                        console.log(telaVideo(el).text());
                    }else{
                        console.log("Deu ruim compatibilidade de titulo (" + texto + ")!!!");
                    }
                }else{
                    console.log("Deu ruim na pesquisa pelo titulo (" + texto + ")!!!");
                }
            })
        }else{
            console.log("Deu ruim na tela de videos !!!");
        }
    })
}

searchVideo();





