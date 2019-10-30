const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');

const file = "Songs.txt"

LINK_YOUTUBE = 'https://www.youtube.com';

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

function searchVideo(){
    let songs = getSongs();
    let links = [];

    if(songs != null){

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
                    console.log("Deu ruim na pesquisa pelo nome (" + item + ")!!!");
                }
            })
        })
    }else{
        console.log("Não tem nenhuma musica !!!");
    }
}
    
function checkSong(htmlVideo,texto){
        request(LINK_YOUTUBE + htmlVideo + "&pbj=1", function (erro,response,html){
            if(!erro && response.statusCode == 200){
            const telaVideo = cheerio.load(html);

            const title = convertWord(telaVideo('.watch-title').html());

            if(texto == title){
                let url = LINK_YOUTUBE + htmlVideo;
                url = url.replace("youtube","yout");
                downloadSong(url);
            }else{
                console.log("Deu ruim, video errado ... ("+ texto +")");
            }
        }else{
            console.log("Deu ruim na tela de videos !!!");
        }
    })
}

function downloadSong(url){
    request(url, function(erro,response,html){
        if(!erro && response.statusCode == 200){
            
        }
    })
}





