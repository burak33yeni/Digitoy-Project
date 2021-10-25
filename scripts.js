
// constants
const MAX_TILE_NUMBER = 52;
const NUMBER_OF_PLAYERS = 4;

let language = 1; // 0 türkçe 1 english

// tiles array created
const tiles = [];

// okey tiles are stored twice according to their numbers
/*
sarı-1 = 0 ... sarı-13 = 12
mavi-1 = 13 ... mavi-13 = 25
siyah-1 = 26 ... siyah-13 = 38
kırmızı-1 = 39 ... kırmızı-13 = 51
sahte-okey = 52
*/
for (let i = 0; i <= MAX_TILE_NUMBER; i++) {
    tiles.push(i);
    tiles.push(i);
}

// shuffle the tiles (Fisher Yates shuffle)
for (let i = tiles.length - 1; i > 0; i--) {
    let random = Math.floor(Math.random() * i);
    let temp = tiles[i];
    tiles[i] = tiles[random];
    tiles[random] = temp;
}

// select indicator tile that indicates joker (gösterge ve okey taşı seçimi)
let joker; // okey tile
let indTile; // indicator tile (gösterge)
while (true) {
    let randomIndex = Math.floor(Math.random() * tiles.length);
    indTile = tiles[randomIndex];
    if (indTile == 52) { // indicator tile can not be false joker
        continue;
    } else if (indTile == 12 || indTile == 25 || indTile == 38 || indTile == 51) {
        // joker tile will be 1 if selected number is 13
        joker = indTile - 12;
    } else {
        joker = indTile + 1;
    }
    // remove indicator from tiles array
    tiles.splice(randomIndex, 1);
    break;
}

// declare players's array
const plyrTiles = [];
for (let i = 0; i < NUMBER_OF_PLAYERS; i++) {
    plyrTiles[i] = [];
}

// select random dealer (0, 1, 2, 3)
let dealerNumber = Math.floor(Math.random() * NUMBER_OF_PLAYERS);
// giving tiles to dealer and players
for (let i = 0; i < 4; i++) {
    if (i == dealerNumber) { // get dealer index
        for (let index = 0; index < 15; index++) { // give tiles to dealer
            plyrTiles[i].push(tiles.splice(0, 1)[0]);
        }
        for (let j = 0; j < 3; j++) { // for 3 remaining players
            let currPlayerId = (++i) % 4; // find next player index
            for (let index = 0; index < 14; index++) { // give tiles to player
                plyrTiles[currPlayerId].push(tiles.splice(0, 1)[0]);
            }
        }
        break;
    }
}

// sort array numerically
for (let player of plyrTiles) {
    player.sort(function (a, b) { return a - b });
}
// copy initial array to show them in gui later
const initialPlyrTiles = [];
for (let i = 0; i < 4; i++) {
    initialPlyrTiles[i] = [];
    for (let j = 0; j < plyrTiles[i].length; j++) {
        initialPlyrTiles[i].push(plyrTiles[i][j]);
    }
}

// extract jokers and false jokers (okey taşı ve sahte okey)
const plyrJokers = [];
const plyrFalses = [];
let maxJokerCount = 2;
let maxFalseCount = 2;
for (let i = 0; i < NUMBER_OF_PLAYERS; i++) {
    plyrJokers[i] = [];
    plyrFalses[i] = [];
    let currLength = plyrTiles[i].length - 1;
    for (let index = currLength; index >= 0; index--) {
        if (maxJokerCount > 0 || maxFalseCount > 0) {
            if (plyrTiles[i][index] == joker) {
                plyrJokers[i].push(joker);
                plyrTiles[i].splice(index, 1)[0];
                maxJokerCount--;
            }
            else if (plyrTiles[i][index] == 52) {
                plyrFalses[i].push(52);
                plyrTiles[i].splice(index, 1)[0];
                maxFalseCount--;
            }
        }
    }
}

// create proper tiles set for each player
const plyrSets = [];
for (let i = 0; i < NUMBER_OF_PLAYERS; i++) {
    plyrSets[i] = [];
}

// check conditions

// numbers in order (black 1 2 3) and (12 13 1)
// and colors in order (red 1 black 1 yellow 1)
loop:
for (let i = 0; i < NUMBER_OF_PLAYERS; i++) // select player
{
    for (let a = 0; a < plyrTiles[i].length - 2; a++) {
        for (let b = a + 1; b < plyrTiles[i].length - 1; b++) {
            for (let c = b + 1; c < plyrTiles[i].length; c++) {
                if (canThemBe12131Set(plyrTiles[i][a], plyrTiles[i][b], plyrTiles[i][c]) ||
                    canThemBeOrdSet(plyrTiles[i][a], plyrTiles[i][b], plyrTiles[i][c]) ||
                    canThemBeColoredSet(plyrTiles[i][a], plyrTiles[i][b], plyrTiles[i][c])) {
                    const set = [];
                    // add tiles to set
                    // correct display of 12 13 1
                    if (Math.min(plyrTiles[i][a], plyrTiles[i][b], plyrTiles[i][c]) % 13 == 0 &&
                        Math.max(plyrTiles[i][a], plyrTiles[i][b], plyrTiles[i][c]) % 13 == 12) {
                        set.push(Math.max(Math.min(plyrTiles[i][a], plyrTiles[i][b]),
                            Math.min(Math.max(plyrTiles[i][a], plyrTiles[i][b]), plyrTiles[i][c])));
                            set.push(Math.max(plyrTiles[i][a], plyrTiles[i][b], plyrTiles[i][c]));
                            set.push(Math.min(plyrTiles[i][a], plyrTiles[i][b], plyrTiles[i][c]));
                    }
                    else {
                        set.push(Math.min(plyrTiles[i][a], plyrTiles[i][b], plyrTiles[i][c]));
                        set.push(Math.max(Math.min(plyrTiles[i][a], plyrTiles[i][b]),
                            Math.min(Math.max(plyrTiles[i][a], plyrTiles[i][b]), plyrTiles[i][c])));
                        set.push(Math.max(plyrTiles[i][a], plyrTiles[i][b], plyrTiles[i][c]));
                    }
                    plyrSets[i].push(set);
                    // remove tiles from table
                    plyrTiles[i].splice(c, 1)[0];
                    plyrTiles[i].splice(b, 1)[0];
                    plyrTiles[i].splice(a, 1)[0];
                    i--;
                    continue loop;       
                }
            }
        }
    }
}

// special cases with joker or false jokers
loop:
for (let i = 0; i < NUMBER_OF_PLAYERS; i++) { // select player
    // use 1 joker and 0 false
    if (plyrJokers[i].length > 0) {
        // 1 12 13 case
        // 4 5 6 ordinary cases
        // color cases
        for (let a = 0; a < plyrTiles[i].length - 1; a++) {
            for (let b = a + 1; b < plyrTiles[i].length; b++) {
                if (canThemBeSetWithJoker(plyrTiles[i][a], plyrTiles[i][b]) == 12) {
                    const set = [];
                    // add tiles to set array
                    set.push(joker);
                    set.push(plyrTiles[i][Math.max(a, b)]);
                    set.push(plyrTiles[i][Math.min(a, b)]);
                    plyrSets[i].push(set);
                    // remove tiles from table
                    plyrTiles[i].splice(Math.max(a, b), 1)[0];
                    plyrTiles[i].splice(Math.min(a, b), 1)[0];
                    plyrJokers[i].pop();
                    i--;
                    continue loop;
                }
                else if (canThemBeSetWithJoker(plyrTiles[i][a], plyrTiles[i][b]) == 13) {
                    const set = [];
                    // add tiles to set array
                    set.push(plyrTiles[i][Math.max(a, b)]);
                    set.push(joker);
                    set.push(plyrTiles[i][Math.min(a, b)]);
                    plyrSets[i].push(set);
                    // remove tiles from table
                    plyrTiles[i].splice(Math.max(a, b), 1)[0];
                    plyrTiles[i].splice(Math.min(a, b), 1)[0];
                    plyrJokers[i].pop();
                    i--;
                    continue loop;
                }
                else if (canThemBeSetWithJoker(plyrTiles[i][a], plyrTiles[i][b]) == 100) { // 1 2 j
                    const set = [];
                    // add tiles to set array
                    if (Math.abs(plyrTiles[i][a] - plyrTiles[i][b]) == 1) {
                        set.push(plyrTiles[i][Math.min(a, b)]);
                        set.push(plyrTiles[i][Math.max(a, b)]);
                        set.push(joker);
                    }
                    else if (Math.abs(plyrTiles[i][a] - plyrTiles[i][b]) == 2) {

                        set.push(plyrTiles[i][Math.min(a, b)]);
                        set.push(joker);
                        set.push(plyrTiles[i][Math.max(a, b)]);
                    }
                    plyrSets[i].push(set);
                    // remove tiles from table
                    plyrTiles[i].splice(Math.max(a, b), 1)[0];
                    plyrTiles[i].splice(Math.min(a, b), 1)[0];
                    plyrJokers[i].pop();
                    i--;
                    continue loop;
                }
                else if (canThemBeSetWithJoker(plyrTiles[i][a], plyrTiles[i][b]) == 255) { // color
                    const set = [];
                    // add tiles to set array
                    set.push(joker);
                    set.push(plyrTiles[i][a]);
                    set.push(plyrTiles[i][b]);
                    plyrSets[i].push(set);
                    // remove tiles from table
                    plyrTiles[i].splice(Math.max(a, b), 1)[0];
                    plyrTiles[i].splice(Math.min(a, b), 1)[0];
                    plyrJokers[i].pop();
                    i--;
                    continue loop;
                }
            }
        }
    }

    // use 1 joker and 1 false
    else if (plyrJokers[i].length > 0 && plyrFalses[i].length > 0) {
        for (let a = 0; a < plyrTiles[i].length; a++) {
            if (canThemBeSetJokerAndFalse(plyrTiles[i][a], joker)) {
                plyrSets[i].push(canThemBeSetJokerAndFalse(plyrTiles[i][a], joker));
                // remove tiles from table
                plyrTiles[i].splice(a, 1)[0];
                plyrFalses[i].pop();
                plyrJokers[i].pop();
                i--;
                continue loop;
            }
        }

    }
    
    // use 2 joker 0 false
    else if (plyrJokers[i].length == 2) {
        if (plyrTiles[i].length > 0) {
            const set = [];
            // add tiles to set 
            // remove tiles from table
            set.push(plyrJokers[i].pop());
            set.push(plyrJokers[i].pop());
            set.push(plyrTiles[i].pop());
            plyrSets[i].push(set);
            i--;
            continue loop;
        }
    }

    // use 2 joker 1 false
    else if (plyrJokers[i].length == 2 && plyrFalses[i].length > 0) {
        const set = [];
        // add tiles to set 
        set.push(plyrJokers[i].pop());
        set.push(plyrJokers[i].pop());
        set.push(plyrFalses[i].pop());
        plyrSets[i].push(set);
        i--;
        continue loop;
    }

    // use 0 joker 1 false
    else if (plyrJokers[i].length == 0 && plyrFalses[i].length > 0) {
        // 1 12 13 case
        // 4 5 6 ordinary cases
        // color cases
        for (let a = 0; a < plyrTiles[i].length - 1; a++) {
            for (let b = a + 1; b < plyrTiles[i].length; b++) {
                if (canThemBe12131Set(plyrTiles[i][a], plyrTiles[i][b], joker) ||
                    canThemBeOrdSet(plyrTiles[i][a], plyrTiles[i][b], joker) ||
                    canThemBeColoredSet(plyrTiles[i][a], plyrTiles[i][b], joker)) {
                    const set = [];
                    // add tiles to set
                    if (Math.max(plyrTiles[i][a], plyrTiles[i][b], joker) == joker) {
                        set.push(Math.min(plyrTiles[i][a], plyrTiles[i][b]));
                        set.push(Math.max(plyrTiles[i][a], plyrTiles[i][b]));
                        set.push(52);
                    }
                    else if (Math.min(plyrTiles[i][a], plyrTiles[i][b], joker) == joker) {
                        set.push(52);
                        set.push(Math.min(plyrTiles[i][a], plyrTiles[i][b]));
                        set.push(Math.max(plyrTiles[i][a], plyrTiles[i][b]));
                    }
                    else {
                        set.push(Math.min(plyrTiles[i][a], plyrTiles[i][b]));
                        set.push(52);
                        set.push(Math.max(plyrTiles[i][a], plyrTiles[i][b]));
                    }
                    plyrSets[i].push(set);
                    // remove tiles from table
                    plyrTiles[i].splice(Math.max(a, b), 1)[0];
                    plyrTiles[i].splice(Math.min(a, b), 1)[0];
                    plyrFalses[i].pop();
                    i--;
                    continue loop;
                }
            }
        }
    }
    // use 1 joker 2 false
    // can not be set
}

// adding 4. and 5. tiles to sets
/*
unnecessary since the aim of the project is to find the winner with
maximum number of sets not number of tiles in sets, so it changes nothing
*/

// functions

// to determine the tile, joker and false joker can be set
// output is a possible set
/*
since false joker equals the number of joker
there is no need to make false joker input variable
*/
function canThemBeSetJokerAndFalse(a, joker) {
    // 12 13 1
    if (joker % 13 == 11 && Math.abs(joker - a) <= 12) {
        if (a % 13 == 0) {
            return [52, joker, a];
        }
        else if (a % 13 == 12) {
            return [52, a, joker]
        }
    }
    else if (joker % 13 == 12 && Math.abs(joker - a) <= 12) {
        if (a % 13 == 0) {
            return [joker, 52, a];
        }
        else if (a % 13 == 11) {
            return [a, 52, joker];
        }
    }
    else if (joker % 13 == 0 && Math.abs(joker - a) <= 12) {
        if (a % 13 == 11) {
            return [a, joker, 52];
        }
        else if (a % 13 == 12) {
            return [joker, a, 52];
        }
    }

    // ordinary numbers
    else if (Math.abs(a - joker) == 2) {
        if (a > joker) 
            return [52, joker, a];
        else 
            return [a, joker, 52];
    }
    else if (Math.abs(a - joker) == 1) {
        if (a > joker)
            return [joker, 52, a];
        else 
            return [joker, a, 52];
    }

    // colors
    else if (a % 13 == joker % 13 && a != joker) {
        return [a, joker, 52];
    }
    return false;
}

// to determine two tiles with joker can be set
// output is 13 if necessary tile is 13 in 12 13 1 condition
// output is 12 if necessary tile is 12 in 12 13 1 condition
// output is 100 if necessary tile is ordinary tile
// output is 255 if necessary tile is color tile
function canThemBeSetWithJoker(a, b) {
    // 12 13 1 - yerine 11 12 13 kulanırız

    // 12 1
    if (Math.max(a, b) % 13 == 11 && Math.min(a, b) % 13 == 0 && Math.abs(a - b) <= 12) {
        return 13;
    }
    // 13 1
    else if (Math.max(a, b) % 13 == 12 && Math.min(a, b) % 13 == 0 && Math.abs(a - b) <= 12) {
        return 12;
    }
    // 1 j 2
    else if (Math.abs(a - b) == 2 || Math.abs(a - b) == 1) {
        return 100;
    }
    // colors
    else if (a % 13 == b % 13 && a != b) {
        return 255;
    }
    return false;
}

// to determine given tiles can be a set with same numbers and different colors or not
function canThemBeColoredSet(a, b, c) {
    if ((a % 13 == b % 13) && (b % 13 == c % 13) && (c % 13 == b % 13)) {
        if (a != b && b != c && a != c) {
            return true;
        }
    }
    return false;
}

// to determine given tiles can be a set with same colors and different numbers or not
function canThemBeOrdSet(a, b, c) {
    if (Math.max(a, b, c) - Math.max(Math.min(a, b), Math.min(Math.max(a, b), c)) == 1) {
        if (Math.max(Math.min(a, b), Math.min(Math.max(a, b), c)) - Math.min(a, b, c) == 1) {
            if (Math.max(a, b, c) % 13 != 0 && Math.max(a, b, c) % 13 != 1) {
                return true;
            }
        }
    }
    return false;
}

// to determine given tiles can be a set according to 12 13 1 rule
function canThemBe12131Set(a, b, c) {
    if (Math.max(a, b, c) % 13 == 12) {
        if (Math.min(a, b, c) % 13 == 0) {
            if (Math.max(Math.min(a, b), Math.min(Math.max(a, b), c)) % 13 == 11) {
                if (Math.max(a, b, c) - Math.min(a, b, c) == 12) {
                    if (Math.max(a, b, c) - Math.max(Math.min(a, b), Math.min(Math.max(a, b), c)) == 1) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}

// functions to be used for html page
function onLoad() {
    getJoker();
    getIndTile();
    getplayer1();
    getplayer1set();
    getplayer2();
    getplayer2set();
    getplayer3();
    getplayer3set();
    getplayer4();
    getplayer4set();
    getWinner();
}
function getJoker() {
    if (language == 1) {
        document.getElementById("joker").innerHTML = "Joker Tile = " + joker;
    }
    else if (language == 0) {
        document.getElementById("joker").innerHTML = "Okey Taşı = " + joker;
    }
}
function getIndTile() {
    if (language == 1) {
        document.getElementById("ind").innerHTML = "Indicator Tile = " + indTile;
    }
    else if (language == 0) {
        document.getElementById("ind").innerHTML = "Gösterge Taşı = " + indTile;
    }
}
function getplayer1() {
    if (language == 1) {
        document.getElementById("p1").innerHTML = "Player 1 Stack<br>" + initialPlyrTiles[0];
    }
    else if (language == 0) {
        document.getElementById("p1").innerHTML = "Oyuncu 1'in Eli<br>" + initialPlyrTiles[0];
    }
}
function getplayer1set() {
    let outputSet = "<br>";
    for (let i = 0; i < plyrSets[0].length; i++) {
        outputSet += plyrSets[0][i] + "<br>";
    }
    if (language == 1) {
        document.getElementById("p1s").innerHTML = "Player 1 Sets" + outputSet;
    }
    else if (language == 0) {
        document.getElementById("p1s").innerHTML = "Oyuncu 1'in Setleri" + outputSet;
    }
}
function getplayer2() {
    if (language == 1) {
        document.getElementById("p2").innerHTML = "Player 2 Stack<br>" + initialPlyrTiles[1];
    }
    else if (language == 0) {
        document.getElementById("p2").innerHTML = "Oyuncu 2'nin Eli<br>" + initialPlyrTiles[1];
    }
}
function getplayer2set() {
    let outputSet = "<br>";
    for (let i = 0; i < plyrSets[1].length; i++) {
        outputSet += plyrSets[1][i] + "<br>";
    }
    if (language == 1) {
        document.getElementById("p2s").innerHTML = "Player 2 Sets" + outputSet;
    }
    else if (language == 0) {
        document.getElementById("p2s").innerHTML = "Oyuncu 2'nin Setleri" + outputSet;
    }
}
function getplayer3() {
    if (language == 1) {
        document.getElementById("p3").innerHTML = "Player 3 Stack<br>" + initialPlyrTiles[2];
    }
    else if (language == 0) {
        document.getElementById("p3").innerHTML = "Oyuncu 3'ün Eli<br>" + initialPlyrTiles[2];
    }
}
function getplayer3set() {
    let outputSet = "<br>";
    for (let i = 0; i < plyrSets[2].length; i++) {
        outputSet += plyrSets[2][i] + "<br>";
    }
    if (language == 1) {
        document.getElementById("p3s").innerHTML = "Player 3 Sets" + outputSet;
    }
    else if (language == 0) {
        document.getElementById("p3s").innerHTML = "Oyuncu 3'ün Setleri" + outputSet;
    }
}
function getplayer4() {
    if (language == 1) {
        document.getElementById("p4").innerHTML = "Player 4 Stack<br>" + initialPlyrTiles[3];
    }
    else if (language == 0) {
        document.getElementById("p4").innerHTML = "Oyuncu 4'ün Eli<br>" + initialPlyrTiles[3];
    } 
}
function getplayer4set() {
    let outputSet = "<br>";
    for (let i = 0; i < plyrSets[3].length; i++) {
        outputSet += plyrSets[3][i] + "<br>";
    }
    if (language == 1) {
        document.getElementById("p4s").innerHTML = "Player 4 Sets" + outputSet;
    }
    else if (language == 0) {
        document.getElementById("p4s").innerHTML = "Oyuncu 4'ün Setleri" + outputSet;
    }
}
function changeLanguage() {
    if (language == 1) {
        language = 0;
        document.getElementById("langButton").innerHTML = "Dili Değiştir";
    }
    else if (language == 0) {
        language = 1;
        document.getElementById("langButton").innerHTML = "Change Language";
    }
    onLoad();
}
function getWinner() {
    let min = -1;
    if (language == 1) {
        let winner = "Anybody :/";
        for (let i = 0; i < plyrSets.length; i++) {
            if (plyrSets[i].length > min) {
                min = plyrSets[i].length;
                if (i == 0) winner = "Player 1";
                else if (i == 1) winner = "Player 2";
                else if (i == 2) winner = "Player 3";
                else if (i == 3) winner = "Player 4";
            }
            else if (plyrSets[i].length == min) {
                if (i == 0) winner += " and Player 1";
                else if (i == 1) winner += " and Player 2";
                else if (i == 2) winner += " and Player 3";
                else if (i == 3) winner += " and Player 4";
            }
        }
        document.getElementById("p5").innerHTML = "Winner = " + winner;
    }
    else if (language == 0) {
        let winner = "Yok :/";
        for (let i = 0; i < plyrSets.length; i++) {
            if (plyrSets[i].length > min) {
                min = plyrSets[i].length;
                if (i == 0) winner = "Oyuncu 1";
                else if (i == 1) winner = "Oyuncu 2";
                else if (i == 2) winner = "Oyuncu 3";
                else if (i == 3) winner = "Oyuncu 4";
            }
            else if (plyrSets[i].length == min) {
                if (i == 0) winner += " ve Oyuncu 1";
                else if (i == 1) winner += " ve Oyuncu 2";
                else if (i == 2) winner += " ve Oyuncu 3";
                else if (i == 3) winner += " ve Oyuncu 4";
            }
        }
        document.getElementById("p5").innerHTML = "Winner = " + winner;
    }

    
    
}