//definerer boardet
const canvas = document.getElementById ("wormBoard")
//henter context
const ctx = canvas.getContext ("2d")

//lager sørrelse på canvas
canvas.width = window.innerHeight*0.6
canvas.height = canvas.width

let tileColors = ["#269020", "green"]
let lineColor = "gray"
let wormColors = ["#FF89D8", "#FFD0FF"]
let dirtColor = "#6A4242"

//setter opp antall fliser det er på canvaset
let gridSize = 20 

//setter en refrshrate
//den bestemmer hvor fort marken beveger seg
const FPS = 10
let play = false
let score = 0;

let lineSize = canvas.height/(gridSize*10)
let tileSize = (canvas.width/gridSize)-lineSize - lineSize/gridSize

//sjekker om griden er riktig størrelse om den ikke er det så legger den til 1
let grid =[]
for(let y = 0; y<gridSize; y++) {
    grid.push([])
    for(let x = 0; x<gridSize; x++) {
        grid[y].push(0)
    }
}

console.log(grid)

//definerer hvor marken skal starte og hvilken vei den beveger seg
//hodet til marken begynner midt i rutenettet og fem fliser fra høyre
let wormHead = {x: 5,y:Math.floor(gridSize/2)}
//halen til marken begynner midt i rutenettet og to fliser fra høyre
let wormTail = {x: 2,y:Math.floor(gridSize/2)}
//viser hvor marken var og gir muligheten  til å legge til et ekstra ledd ettet slangen forlater 
let wormTailPrev = {x: undefined, y: undefined}
let dirtPos = {x:gridSize-3, y: Math.floor(gridSize/2)}

//legger til eple
grid[dirtPos.y][dirtPos.x] = 5

//legger til en mark
//hvis marken er mindre enn fire fliser lang så legger den til en og gjør dette til den er lik 4
for(let x = 0; x<4; x++) {
    // begynner midt i griden mot venstre og setter retningen til høyre
    grid[Math.floor(gridSize/2)][2+x] = 2
}
//setter  hodet sin vei som verdi i rutenettet
let moveQueue = [grid[wormHead.y][wormHead.x]]

//retninger til marken
function moveWormPart(wormPart, direction){
    //får slangen til å gå mot lavere kordinater på y aksen i rutenettet / gå opp
    if(direction == 1){
        wormPart.y--
    }
    //får slangen til å gå mot høyere kordinater på x aksen i rutenettet / gå til høyre
    else if(direction == 2){
        wormPart.x++
    }
    //får slangen til å gå mot høyere kordinater på y aksen i rutenettet / gå ned
    else if(direction == 3){
        wormPart.y++
    }
    //får slangen til å gå mot lavere kordinater på x aksen i rutenettet / gå til venstre
    else{
        wormPart.x--
    }
}

function drawGame() {
    //tegner linjene
    ctx.fillStyle = lineColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    let xCord, yCord
    for(let y = 0; y<gridSize; y++) {
        //regner ut alle linjer og alle fliser sin størrlese og legger dem sammen og legger til en ekstra linje på toppen
        yCord = y*(tileSize+lineSize)+lineSize
        for(let x = 0; x<gridSize; x++) {
            if(grid[y][x] == 0){
                //annenhver flis er lyse og mørkegrønn
                ctx.fillStyle = tileColors[(x+y)%2]
            }
            //5=Jord som marken spiser
            else if(grid[y][x] == 5){
                ctx.fillStyle = dirtColor
            }
            //her tegnes marken
            else{
                ctx.fillStyle = wormColors[(x+y)%2]
            }

            //regner ut alle linjer og alle fliser sin størrlese og legger dem sammen og legger til en ekstra linje på venstre side
            xCord = x*(tileSize+lineSize)+lineSize

            //denne tegner, IKKE RØR DENNE!!!
            ctx.fillRect(xCord, yCord, tileSize, tileSize)
            //OPS les ^
        }
    }
}

document.addEventListener('keydown', (event) => {

    // Start game on first key press
    play = true

    //gir spilleren mulighet til å bruke WASD og piltastene til å bevege seg
    if ((event.key.toLowerCase() == "w") || (event.key == "ArrowUp")) {
        //hindrer å rygge i seg selv
        if (moveQueue[moveQueue.length-1] != 3 && moveQueue[moveQueue.length-1] != 1) {
            moveQueue.push(1)
        }
    }
    //^
    else if ((event.key.toLowerCase() == "d") || (event.key == "ArrowRight")) {
        //^
        if (moveQueue[moveQueue.length-1] != 4 && moveQueue[moveQueue.length-1] != 2) {
            moveQueue.push(2)
        }
    }
    //^
    else if ((event.key.toLowerCase() == "s") || (event.key == "ArrowDown")) {
        //^
        if (moveQueue[moveQueue.length-1] != 1 && moveQueue[moveQueue.length-1] != 3) {
            moveQueue.push(3)
        }
    }
    //^
    else if ((event.key.toLowerCase() == "a") || (event.key == "ArrowLeft")) {
        //^
        if (moveQueue[moveQueue.length-1] != 2 && moveQueue[moveQueue.length-1] != 4) {
            moveQueue.push(4)
        }
    }
})


//starter spillet når man trykker på noe
function gameLoop(){
    if(play){
        if(moveQueue.length > 1){
            //fjerner brukte komandoer fra bevegelseslisten
            moveQueue.shift()
        }
        //flytter hodet
        grid[wormHead.y][wormHead.x] = moveQueue[0]
        moveWormPart(wormHead, grid[wormHead.y][wormHead.x])

        //sjekker om marken kolliderer med en vegg
        if ((wormHead.x >= gridSize) || (wormHead.y >= gridSize) || (wormHead.x < 0) || (wormHead.y < 0)) {
            return
        }

        //hvis eplet blir spist så beverger ikke halen seg med en gang
        if(grid[wormHead.y][wormHead.x] != 5){
            wormTailPrev = {x: wormTail.x, y:wormTail.y}
            moveWormPart(wormTail, grid[wormTail.y][wormTail.x])
            grid[wormTailPrev.y][wormTailPrev.x] = 0
            
        }
        //lager en ny jordflekk om det forrige har blitt spist 
        else{
            //sjekker om posisjonen til jorden ikke er 0
            while(grid[dirtPos.y][dirtPos.x] != 0){
                //velger en tilfeldig plass å generere en ny jordflekk
                //plassen på x aksen i griden regnes ut ved et tall fra 0 til 0,99 ganger størrelsen på griden og runder dette ned
                dirtPos.x = Math.floor(Math.random() * gridSize)
                //plassen på y aksen i griden regnes ut ved et tall fra 0 til 0,99 ganger størrelsen på griden og runder dette ned
                dirtPos.y = Math.floor(Math.random() * gridSize)
            }
            //definerer at jordflekken har verdien 5 i rutenettet
            grid[dirtPos.y][dirtPos.x] = 5

            if (grid[wormHead.y][wormHead.x] != 0) {
                //Øker scoren hvis et eple blir spist
                score += 1;
                // Viser scoren på skjermen
                document.getElementById('score').innerHTML = score;
              }
        }

        //sjekker om marken kolliderer med seg selv
        if (grid[wormHead.y][wormHead.x] != 0 && grid[wormHead.y][wormHead.x] != 5) {
            return
        }
     

        //overskriver hodets posisjon med ny rettning
        grid[wormHead.y][wormHead.x] = moveQueue[0]
        
    }
    //kjører spillet for evig
    drawGame()
    setTimeout(gameLoop,1000/FPS)
}

//caller scriptet gameloop som får spillet til å kjøre til man taper
gameLoop()
