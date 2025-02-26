class RJMTurtle {
    constructor() {
        this.block = "1";
        this.nib = [[0,0,0]];
        this.pos = [0,0,0];
        this.penDown = true;
        this.matrix = null;
        this.TO_RADIANS = Math.PI / 180;
    }
    
    clone() {
        var t = new RJMTurtle();
        t.block = this.block;
        t.nib = this.nib;
        t.pos = this.pos;
        t.penDown = this.penDown;
        t.matrix = this.matrix;
        return t;
    }
    
    mmMultiply(a,b) {
        var c = [[0,0,0],[0,0,0],[0,0,0]];
        for (var i = 0; i < 3 ; i++) for (var j = 0; j < 3 ; j++)
          c[i][j] = a[i][0]*b[0][j] + a[i][1]*b[1][j] + a[i][2]*b[2][j];
        return c;
    };
    
    mod(n,m) {
        return ((n%m)+m)%m;
    };
    
    cosDegrees(angle) {
        if (this.mod(angle,90) == 0) {
            return [1,0,-1,0][this.mod(angle,360)/90];
        }
        else {
            return Math.cos(angle * this.TO_RADIANS);
        }
    }
    
    sinDegrees(angle) {
        if (this.mod(angle,90) == 0) {
            return [0,1,0,-1][this.mod(angle,360)/90];
        }
        else {
            return Math.sin(angle * this.TO_RADIANS);
        }
    }
    
    yawMatrix(angle) {
        var c = this.cosDegrees(angle);
        var s = this.sinDegrees(angle);
        return [[c, 0, -s],
                [0, 1, 0],
                [s, 0, c]];
    };
    
    rollMatrix(angle) {
        var c = this.cosDegrees(angle);
        var s = this.sinDegrees(angle);
        return [[c, -s, 0],
                [s,  c, 0],
                [0,  0, 1]];
    };
    
    pitchMatrix(angle) {
        var c = this.cosDegrees(angle);
        var s = this.sinDegrees(angle);
        return [[1, 0, 0],
                [0, c, s],
                [0,-s, c]];
    };
}

class RaspberryJamMod {
    constructor(runtime) {
        this.clear();
    }
    
    clear() {
        this.socket = null;
        this.hits = [];
        this.turtle = new RJMTurtle();
        this.turtleHistory = [];
        this.savedBlocks = null;
    }
    
    getInfo() {
        return {
            "id": "RaspberryJamMod",
            "name": "Minecraft",
            
            "blocks": [{
                    "opcode": "connect_p",
                    "blockType": "command",
                    "text": "подключиться к Minecraft по адресу [ip]",
                    "arguments": {
                        "ip": {
                            "type": "string",
                            "defaultValue": "localhost"
                        },
                    }
            },
            {
                    "opcode": "chat",
                    "blockType": "command",
                    "text": "сказать в чате [msg]",
                    "arguments": {
                        "msg": {
                            "type": "string",
                            "defaultValue": "Hello, World!"
                        },
                    }
            },            
            {
                    "opcode": "blockByName",
                    "blockType": "reporter",
                    "text": "ID блока для [name]",
                    "arguments": {
                        "name": {
                            "type": "string",
                            "defaultValue": "1,0",
                            "menu": "blockMenu"
                        }
                    }
            },            
            {
                    "opcode": "getBlock",
                    "blockType": "reporter",
                    "text": "ID блока в ([x],[y],[z])",
                    "arguments": {
                        "x": {
                            "type": "number",
                            "defaultValue": "0"
                        },
                        "y": {
                            "type": "number",
                            "defaultValue": "0"
                        },
                        "z": {
                            "type": "number",
                            "defaultValue": "0"
                        },
                    }
            },             
            {
                    "opcode": "getPlayerX",
                    "blockType": "reporter",
                    "text": "x-координата игрока ([mode] положение)",
                    "arguments": {
                        "mode": {
                            "type": "number",
                            "defaultValue": 0,
                            "menu": "modeMenu"
                        },
                    }
            },            
            {
                    "opcode": "getPlayerY",
                    "blockType": "reporter",
                    "text": "y-координата игрока ([mode] положение)",
                    "arguments": {
                        "mode": {
                            "type": "number",
                            "defaultValue": 0,
                            "menu": "modeMenu"
                        },
                    }
            },            
            {
                    "opcode": "getPlayerZ",
                    "blockType": "reporter",
                    "text": "z-координата игрока ([mode] положение)",
                    "arguments": {
                        "mode": {
                            "type": "number",
                            "defaultValue": 0,
                            "menu": "modeMenu"
                        },
                    }
            },
            {
                    "opcode": "getPlayerVector",
                    "blockType": "reporter",
                    "text": "вектор позиции игрока ([mode] положение)",
                    "arguments": {
                        "mode": {
                            "type": "number",
                            "defaultValue": 0,
                            "menu": "modeMenu"
                        },
                    }
            },
            {
                    "opcode": "getHit",
                    "blockType": "reporter",
                    "text": "вектор удара меча",
                    "arguments": {
                    }
            },            
            {
                    "opcode": "extractFromVector",
                    "blockType": "reporter",
                    "text": "[coordinate]-ая координата вектора [vector]",
                    "arguments": {
                        "coordinate": {
                            "type": "number",
                            "defaultValue": 0,
                            "menu": "coordinateMenu"
                        },
                        "vector": {
                            "type": "string",
                            "defaultValue": "0,0,0",
                        },
                    }
            },          
            {
                    "opcode": "makeVector",
                    "blockType": "reporter",
                    "text": "вектор ([x],[y],[z])",
                    "arguments": {
                        "x": {
                            "type": "number",
                            "defaultValue": 0,
                        },
                        "y": {
                            "type": "number",
                            "defaultValue": 0,
                        },
                        "z": {
                            "type": "number",
                            "defaultValue": 0,
                        },
                    }
            },                
            {
                    "opcode": "setBlock",
                    "blockType": "command",
                    "text": "установить [b] в ([x],[y],[z])",
                    "arguments": {
                        "x": {
                            "type": "number",
                            "defaultValue": "0"
                        },
                        "y": {
                            "type": "number",
                            "defaultValue": "0"
                        },
                        "z": {
                            "type": "number",
                            "defaultValue": "0"
                        },
                        "b": {
                            "type": "string",
                            "defaultValue": "1,0",
                            "menu": "blockMenu"
                        },
                    }
            },            
            {
                    "opcode": "setPlayerPos",
                    "blockType": "command",
                    "text": "переместить игрока в ([x],[y],[z])",
                    "arguments": {
                        "x": {
                            "type": "number",
                            "defaultValue": 0
                        },
                        "y": {
                            "type": "number",
                            "defaultValue": 0
                        },
                        "z": {
                            "type": "number",
                            "defaultValue": 0
                        },
                    }
            },            
            {
                    "opcode": "movePlayer",
                    "blockType": "command",
                    "text": "сдвинуть игрока на ([dx],[dy],[dz])",
                    "arguments": {
                        "dx": {
                            "type": "number",
                            "defaultValue": 0
                        },
                        "dy": {
                            "type": "number",
                            "defaultValue": 0
                        },
                        "dz": {
                            "type": "number",
                            "defaultValue": 0
                        },
                    }
            },         
            {
                    "opcode": "movePlayerTop",
                    "blockType": "command",
                    "text": "поднять игрока наверх",
                    "arguments": {
                    }
            },         
            {
                    "opcode": "spawnEntity",
                    "blockType": "command",
                    "text": "создать [entity] в ([x],[y],[z])",
                    "arguments": {
                        "entity": {
                            "type": "string",
                            "defaultValue": "Villager",
                            "menu": "entityMenu"
                        },
                        "x": {
                            "type": "number",
                            "defaultValue": 0
                        },
                        "y": {
                            "type": "number",
                            "defaultValue": 0
                        },
                        "z": {
                            "type": "number",
                            "defaultValue": 0
                        },
                    }
            },
            {
                    "opcode": "moveTurtle",
                    "blockType": "command",
                    "text": "двигать черепашку [dir] на [n]",
                    "arguments": {
                        "dir": {
                            "type": "number",
                            "menu": "moveMenu",
                            "defaultValue": 1
                        },
                        "n": {
                            "type": "number",
                            "defaultValue": "1"
                        },
                    }
            },            
            {
                    "opcode": "leftTurtle",
                    "blockType": "command",
                    "text": "черепашка повернуть налево на [n] градусов",
                    "arguments": {
                        "n": {
                            "type": "number",
                            "defaultValue": "15"
                        },
                    }
            },            
            {
                    "opcode": "rightTurtle",
                    "blockType": "command",
                    "text": "черепашка повернуть направо на [n] градусов",
                    "arguments": {
                        "n": {
                            "type": "number",
                            "defaultValue": "15"
                        },
                    }
            },            
            {
                    "opcode": "turnTurtle",
                    "blockType": "command",
                    "text": "черепашка повернуть [dir] на [n] градусов",
                    "arguments": {
                        "dir": {
                            "type": "string",
                            "menu": "turnMenu",
                            "defaultValue": "pitch"
                        },
                        "n": {
                            "type": "number",
                            "defaultValue": "15"
                        },
                    }
            },            
            {
                    "opcode": "pen",
                    "blockType": "command",
                    "text": "перо черепашки [state]",
                    "arguments": {
                        "state": {
                            "type": "number",
                            "defaultValue": 1,
                            "menu": "penMenu"
                        }
                    }
            },            
            {
                    "opcode": "turtleBlock",
                    "blockType": "command",
                    "text": "блок пера черепашки [b]",
                    "arguments": {
                        "b": {
                            "type": "string",
                            "defaultValue": "1,0",
                            "menu": "blockMenu"
                        }
                    }
            },            
            {
                    "opcode": "turtleThickness",
                    "blockType": "command",
                    "text": "толщина пера черепашки [n]",
                    "arguments": {
                        "n": {
                            "type": "number",
                            "defaultValue": 1,
                        }
                    }
            },            
            {
                    "opcode": "setTurtlePosition",
                    "blockType": "command",
                    "text": "переместить черепашку в ([x],[y],[z])",
                    "arguments": {
                        "x": {
                            "type": "number",
                            "defaultValue": 0
                        },
                        "y": {
                            "type": "number",
                            "defaultValue": 0
                        },
                        "z": {
                            "type": "number",
                            "defaultValue": 0
                        },
                    }
            },            
            {
                    "opcode": "resetTurtleAngle",
                    "blockType": "command",
                    "text": "сбросить угол черепашки до [n] градусов",
                    "arguments": {
                        "n": {
                            "type": "number",
                            "defaultValue": "0"
                        },
                    }
            },            
            {
                    "opcode": "saveTurtle",
                    "blockType": "command",
                    "text": "сохранить состояние черепашки",
                    "arguments": {
                    }
            },            
            {
                    "opcode": "restoreTurtle",
                    "blockType": "command",
                    "text": "восстановить состояние черепашки",
                    "arguments": {
                    }
            },            
            {
                    "opcode": "suspend",
                    "blockType": "command",
                    "text": "приостановить рисование",
                    "arguments": {
                    }
            },            
            {
                    "opcode": "resume",
                    "blockType": "command",
                    "text": "возобновить рисование",
                    "arguments": {
                    }
            },            
            ],
        "menus": {
            moveMenu: [{text:"вперёд",value:1}, {text:"назад",value:-1}],
            penMenu: [{text:"опущено",value:1}, {text:"поднято",value:0}],
            coordinateMenu: [{text:"x",value:0}, {text:"y",value:1}, {text:"z",value:2}],
            turnMenu: [ "рысканье", "тангаж", "крен" ],
            modeMenu: [{text:"точное",value:1},{text:"блочное",value:0}],
            entityMenu: ["Item",
                "XPOrb",
                "LeashKnot",
                "Painting",
                "Arrow",
                "Snowball",
                "Fireball",
                "SmallFireball",
                "ThrownEnderpearl",
                "EyeOfEnderSignal",
                "ThrownPotion",
                "ThrownExpBottle",
                "ItemFrame",
                "WitherSkull",
                "PrimedTnt",
                "FallingSand",
                "FireworksRocketEntity",
                "ArmorStand",
                "Boat",
                "MinecartRideable",
                "MinecartChest",
                "MinecartFurnace",
                "MinecartTNT",
                "MinecartHopper",
                "MinecartSpawner",
                "MinecartCommandBlock",
                "Mob",
                "Monster",
                "Creeper",
                "Skeleton",
                "Spider",
                "Giant",
                "Zombie",
                "Slime",
                "Ghast",
                "PigZombie",
                "Enderman",
                "CaveSpider",
                "Silverfish",
                "Blaze",
                "LavaSlime",
                "EnderDragon",
                "WitherBoss",
                "Bat",
                "Witch",
                "Endermite",
                "Guardian",
                "Pig",
                "Sheep",
                "Cow",
                "Chicken",
                "Squid",
                "Wolf",
                "MushroomCow",
                "SnowMan",
                "Ozelot",
                "VillagerGolem",
                "EntityHorse",
                "Rabbit",
                "Villager",
                "EnderCrystal",],
            blockMenu: { acceptReporters: true,
                items: [
                {text:"воздух",value:"0,0"},
                {text:"кровать",value:"26,0"},
                {text:"бедрок",value:"7,0"},
                {text:"книжная полка",value:"47,0"},
                {text:"кирпичный блок",value:"45,0"},
                {text:"кактус",value:"81,0"},
                {text:"черный ковер",value:"171,15"},
                {text:"синий ковер",value:"171,11"},
                {text:"коричневый ковер",value:"171,12"},
                {text:"бирюзовый ковер",value:"171,9"},
                {text:"серый ковер",value:"171,7"},
                {text:"зеленый ковер",value:"171,13"},
                {text:"светло-синий ковер",value:"171,3"},
                {text:"светло-серый ковер",value:"171,8"},
                {text:"лаймовый ковер",value:"171,5"},
                {text:"малиновый ковер",value:"171,2"},
                {text:"оранжевый ковер",value:"171,1"},
                {text:"розовый ковер",value:"171,6"},
                {text:"фиолетовый ковер",value:"171,10"},
                {text:"красный ковер",value:"171,14"},
                {text:"белый ковер",value:"171"},
                {text:"желтый ковер",value:"171,4"},
                {text:"сундук",value:"54,0"},
                {text:"глина",value:"82,0"},
                {text:"блок угля",value:"173,0"},
                {text:"руда угля",value:"16,0"},
                {text:"булыжник",value:"4,0"},
                {text:"паутина",value:"30,0"},
                {text:"верстак",value:"58,0"},
                {text:"алмазный блок",value:"57,0"},
                {text:"алмазная руда",value:"56,0"},
                {text:"земля",value:"3,0"},
                {text:"железная дверь",value:"71,0"},
                {text:"деревянная дверь",value:"64,0"},
                {text:"двойная высокая трава",value:"175,2"},
                {text:"обработанная земля",value:"60,0"},
                {text:"ворота забора",value:"107,0"},
                {text:"забор",value:"85,0"},
                {text:"огонь",value:"51,0"},
                {text:"голубой цветок",value:"38,0"},
                {text:"желтый цветок",value:"37,0"},
                {text:"работающая печь",value:"62,0"},
                {text:"неактивная печь",value:"61,0"},
                {text:"стеклянная панель",value:"102,0"},
                {text:"стекло",value:"20,0"},
                {text:"блок светокамня",value:"89,0"},
                {text:"золотой блок",value:"41,0"},
                {text:"золотая руда",value:"14,0"},
                {text:"травка",value:"2,0"},
                {text:"булыжник",value:"31,0"},
                {text:"гравий",value:"13,0"},
                {text:"окрашенная глина черного цвета",value:"159,15"},
                {text:"окрашенная глина синего цвета",value:"159,11"},
                {text:"окрашенная глина коричневого цвета",value:"159,12"},
                {text:"окрашенная глина бирюзового цвета",value:"159,9"},
                {text:"окрашенная глина серого цвета",value:"159,7"},
                {text:"окрашенная глина зеленого цвета",value:"159,13"},
                {text:"окрашенная глина светло-синего цвета",value:"159,3"},
                {text:"окрашенная глина светло-серого цвета",value:"159,8"},
                {text:"окрашенная глина лаймового цвета",value:"159,5"},
                {text:"окрашенная глина малинового цвета",value:"159,2"},
                {text:"окрашенная глина оранжевого цвета",value:"159,1"},
                {text:"окрашенная глина розового цвета",value:"159,6"},
                {text:"окрашенная глина фиолетового цвета",value:"159,10"},
                {text:"окрашенная глина красного цвета",value:"159,14"},
                {text:"окрашенная глина белого цвета",value:"159,0"},
                {text:"окрашенная глина желтого цвета",value:"159,4"},
                {text:"лед",value:"79,0"},
                {text:"железный блок",value:"42,0"},
                {text:"железная руда",value:"15,0"},
                {text:"лесенка",value:"65,0"},
                {text:"лазуритовый блок",value:"22,0"},
                {text:"лазуритовая руда",value:"21,0"},
                {text:"большой папоротник",value:"175,3"},
                {text:"текущая лава",value:"10,0"},
                {text:"стационарная лава",value:"11,0"},
                {text:"листья березы",value:"18,6"},
                {text:"листья джунглей",value:"18,7"},
                {text:"листья дуба",value:"18,4"},
                {text:"листья ели",value:"18,5"},
                {text:"листья",value:"18,0"},
                {text:"сирень",value:"175,1"},
                {text:"дыня",value:"103,0"},
                {text:"моховой камень",value:"48,0"},
                {text:"коричневый гриб",value:"39,0"},
                {text:"красный гриб",value:"40,0"},
                {text:"обсидиан",value:"49,0"},
                {text:"пион",value:"175,5"},
                {text:"блок кварца",value:"155,0"},
                {text:"блок красного камня",value:"152,0"},
                {text:"активная красная лампа",value:"124,0"},
                {text:"неактивная красная лампа",value:"123,0"},
                {text:"руда красного камня",value:"73,0"},
                {text:"кустарник роз",value:"175,4"},
                {text:"песок",value:"12,0"},
                {text:"песчаник",value:"24,0"},
                {text:"саженец",value:"6,0"},
                {text:"морской фонарь",value:"169,0"},
                {text:"блок снега",value:"80,0"},
                {text:"снег",value:"78,0"},
                {text:"окрашенное стекло черного цвета",value:"95,15"},
                {text:"окрашенное стекло синего цвета",value:"95,11"},
                {text:"окрашенное стекло коричневого цвета",value:"95,12"},
                {text:"окрашенное стекло бирюзового цвета",value:"95,9"},
                {text:"окрашенное стекло серого цвета",value:"95,7"},
                {text:"окрашенное стекло зеленого цвета",value:"95,13"},
                {text:"окрашенное стекло светло-синего цвета",value:"95,3"},
                {text:"окрашенное стекло светло-серого цвета",value:"95,8"},
                {text:"окрашенное стекло лаймового цвета",value:"95,5"},
                {text:"окрашенное стекло малинового цвета",value:"95,2"},
                {text:"окрашенное стекло оранжевого цвета",value:"95,1"},
                {text:"окрашенное стекло розового цвета",value:"95,6"},
                {text:"окрашенное стекло фиолетового цвета",value:"95,10"},
                {text:"окрашенное стекло красного цвета",value:"95,14"},
                {text:"окрашенное стекло белого цвета",value:"95,0"},
                {text:"окрашенное стекло желтого цвета",value:"95,4"},
                {text:"ступеньки из булыжника",value:"67,0"},
                {text:"деревянные ступеньки",value:"53,0"},
                {text:"кирпичный камень",value:"98,0"},
                {text:"каменная кнопка",value:"77,0"},
                {text:"двойная каменная плитка",value:"43,0"},
                {text:"каменная плитка",value:"44,0"},
                {text:"камень",value:"1,0"},
                {text:"сахарный тростник",value:"83,0"},
                {text:"подсолнух",value:"175,0"},
                {text:"TNT",value:"46,0"},
                {text:"факел",value:"50,0"},
                {text:"текущая вода",value:"8,0"},
                {text:"стоящая вода",value:"9,0"},
                {text:"деревянная кнопка",value:"143,0"},
                {text:"деревянные доски",value:"5,0"},
                {text:"дерево",value:"17,0"},
                {text:"шерсть черная",value:"35,15"},
                {text:"шерсть синяя",value:"35,11"},
                {text:"шерсть коричневая",value:"35,12"},
                {text:"шерсть бирюзовая",value:"35,9"},
                {text:"шерсть серая",value:"35,7"},
                {text:"шерсть зеленая",value:"35,13"},
                {text:"шерсть светло-синяя",value:"35,3"},
                {text:"шерсть светло-серая",value:"35,8"},
                {text:"шерсть лаймовая",value:"35,5"},
                {text:"шерсть малиновая",value:"35,2"},
                {text:"шерсть оранжевая",value:"35,1"},
                {text:"шерсть розовая",value:"35,6"},
                {text:"шерсть фиолетовая",value:"35,10"},
                {text:"шерсть красная",value:"35,14"},
                {text:"шерсть белая",value:"35,0"},
                {text:"шерсть желтая",value:"35,4"}
            ]            
            }
            }
        };
    };
    
    parseXYZ(x,y,z) {
        var coords = [];
        if (typeof(x)=="string" && x.indexOf(",") >= 0) {
            return x.split(",").map(parseFloat);
        }
        else {
            return [x,y,z];
        }
    }

    blockByName({name}){
        return name;
    }
    
    sendAndReceive(msg) {
        var rjm = this;
        return new Promise(function(resolve, reject) {            
            rjm.socket.onmessage = function(event) {
                resolve(event.data.trim());
            };
            rjm.socket.onerror = function(err) {
                reject(err);
            };
            rjm.socket.send(msg);
        });
    };
    
    resume() {
        if (this.savedBlocks != null) {
            for (var [key, value] of this.savedBlocks)
                this.socket.send("world.setBlock("+key+","+value+")");
            this.savedBlocks = null;
        }
    };
    
    suspend() {
        if (this.savedBlocks == null) {
            this.savedBlocks = new Map();
        }
    };
    
    drawBlock(x,y,z,b) {
        if (this.savedBlocks != null) {
            this.savedBlocks.set(""+x+","+y+","+z, b);
        }
        else {
            this.socket.send("world.setBlock("+x+","+y+","+z+","+b+")");
        }
    };

    drawLine(x1,y1,z1,x2,y2,z2) {
        var l = this.getLine(x1,y1,z1,x2,y2,z2);
        
        for (var i=0; i<l.length ; i++) {
            this.drawBlock(l[i][0],l[i][1],l[i][2],this.turtle.block);
        }
    };
    
    turnTurtle({dir,n}) {
        if (dir=="right" || dir=="yaw") {
            this.turtle.matrix = this.turtle.mmMultiply(this.turtle.matrix, this.turtle.yawMatrix(n));    
        }
        else if (dir=="pitch") {
            this.turtle.matrix = this.turtle.mmMultiply(this.turtle.matrix, this.turtle.pitchMatrix(n));    
        }
        else { // if (dir=="roll") {
            this.turtle.matrix = this.turtle.mmMultiply(this.turtle.matrix, this.turtle.rollMatrix(n));    
        }
    };
    
    leftTurtle({n}) {
        this.turtle.matrix = this.turtle.mmMultiply(this.turtle.matrix, this.turtle.yawMatrix(-n));    
    }
    
    rightTurtle({n}) {
        this.turtle.matrix = this.turtle.mmMultiply(this.turtle.matrix, this.turtle.yawMatrix(n));
    }
    
    resetTurtleAngle({n}) {
        this.turtle.matrix = this.turtle.yawMatrix(n);
    };
    
    pen({state}) {
        this.turtle.penDown = state;
    }
    
    turtleBlock({b}) {
        this.turtle.block = b;
    }
    
    turtleBlockEasy({b}) {
        this.turtle.block = b;
    }
    
    setTurtlePosition({x,y,z}) {
        this.turtle.pos = this.parseXYZ(x,y,z);
    }
    
    turtleThickness({n}) {
        if (n==0) {
            this.turtle.nib = [];
        }
        else if (n==1) {
            this.turtle.nib = [[0,0,0]];
        }
        else if (n==2) {
            this.turtle.nib = [];
            for (var x=0; x<=1; x++) 
                for (var y=0; y<=1; y++) 
                    for (var z=0; z<=1; z++) 
                        this.turtle.nib.push([x,y,z]);
        }
        else {
            var r2 = n*n/4;
            var d = Math.ceil(n/2);
            this.turtle.nib = [];
            for (var x=-d; x<=d; x++) 
                for (var y=-d; y<=d; y++) 
                    for (var z=-d; z<=d; z++) 
                        if (x*x+y*y+z*z <= r2)
                            this.turtle.nib.push([x,y,z]);
        }
    }
    
    saveTurtle() {
        var t = this.turtle.clone();
        this.turtleHistory.push(t);
    }
    
    restoreTurtle() {
        if (this.turtleHistory.length > 0) {
            this.turtle = this.turtleHistory.pop();
        }
    }

    drawPoint(x0,y0,z0) {
        var l = this.turtle.nib.length;
        if (l == 0) {
            return;
        }
        else if (l == 1) {
            this.drawBlock(x0,y0,z0,this.turtle.block)
            return;
        }

        for (var i = 0 ; i < l ; i++) {
            var p = this.turtle.nib[i];
            var x = p[0] + x0;
            var y = p[1] + y0;
            var z = p[2] + z0;
            this.drawBlock(x,y,z,this.turtle.block)
        }
    };

    moveTurtle({dir,n}) {
        n *= dir;
        var newX = this.turtle.pos[0] + this.turtle.matrix[0][2] * n;
        var newY = this.turtle.pos[1] + this.turtle.matrix[1][2] * n;
        var newZ = this.turtle.pos[2] + this.turtle.matrix[2][2] * n;
        if (this.turtle.penDown != 0)
            this.drawLine(Math.round(this.turtle.pos[0]),Math.round(this.turtle.pos[1]),Math.round(this.turtle.pos[2]),Math.round(newX),Math.round(newY),Math.round(newZ));
        this.turtle.pos = [newX,newY,newZ];
    }; 
    
    getPosition() {
        return this.sendAndReceive("player.getPos()")
            .then(pos => {
                var p = pos.split(",");
                return [parseFloat(p[0]),parseFloat(p[1]),parseFloat(p[2])];
            });
    };

    spawnEntity({entity,x,y,z}) {
        var [x,y,z] = this.parseXYZ(x,y,z);
        return this.sendAndReceive("world.spawnEntity("+entity+","+x+","+y+","+z+")"); // TODO: do something with entity ID?
    };

    movePlayer({dx,dy,dz}) {
        var [x,y,z] = this.parseXYZ(dx,dy,dz).map(Math.floor);
        return this.getPosition().then(pos => this.setPlayerPos({x:pos[0]+x,y:pos[1]+y,z:pos[2]+z}));
    };

    movePlayerTop() {
        return this.getPosition().then(pos => 
            this.sendAndReceive("world.getHeight("+Math.floor(pos[0])+","+Math.floor(pos[2])+")").then(
                height => this.setPlayerPos({x:pos[0],y:height,z:pos[2]})));
    };

    getRotation() {
        return this.sendAndReceive("player.getRotation()")
            .then(r => {
                return parseFloat(r);
            });
    };
    
    getBlock({x,y,z}) {
        var pos = ""+this.parseXYZ(x,y,z).map(Math.floor);
        if (this.savedBlocks != null) {
            if (this.savedBlocks.has(pos)) {
                var b = this.savedBlocks.get(pos);
                if (b.indexOf(",")<0)
                    return ""+b+",0";
                else
                    return b;
            }
        }
        return this.sendAndReceive("world.getBlockWithData("+pos+")")
            .then(b => {
                return b;
            });
    };

    onBlock({b}) {
        return this.getPosition().then( pos => this.sendAndReceive("world.getBlockWithData("+Math.floor(pos[0])+","+Math.floor(pos[1]-1)+","+Math.floor(pos[2])+")")
                    .then( block => block == b ) );
    }

    haveBlock({b,x,y,z}) {
        var [x,y,z] = this.parseXYZ(x,y,z).map(Math.floor);
        return this.sendAndReceive("world.getBlockWithData("+x+","+y+","+z+")")
            .then(block => {
                return block == b;
            });
    };
    
    getPlayerVector({mode}) {
        return this.getPosition()
            .then(pos => mode != 0 ? ""+pos[0]+","+pos[1]+","+pos[2] : ""+Math.floor(pos[0])+","+Math.floor(pos[1])+","+Math.floor(pos[2]));
    };
    
    makeVector({x,y,z}) {
        return ""+x+","+y+","+z
    }
    
    getHit() {
        if (this.hits.length>0) 
            return ""+this.hits.shift().slice(0,3);
        var rjm = this;
        return this.sendAndReceive("events.block.hits()")
            .then(result => {
                if (result.indexOf(",") < 0) 
                    return "";
                
                else {
                    var hits = result.split("|");
                    for(var i=0;i<hits.length;i++)
                        rjm.hits.push(hits[i].split(",").map(parseFloat));
                }
                return ""+this.shift.pop().slice(0,3);
            });
    };

    extractFromVector({vector,coordinate}) {
        var v = vector.split(",");
        if (v.length <= coordinate) {
            return 0.;
        }
        else {
            return parseFloat(v[coordinate]);
        }
    };

    getPlayerX({mode}) {
        return this.getPosition()
            .then(pos => mode != 0 ? pos[0] : Math.floor(pos[0]));
    };

    getPlayerY({mode}) {
        return this.getPosition()
            .then(pos => mode != 0 ? pos[1] : Math.floor(pos[1]));
    };

    getPlayerZ({mode}) {
        return this.getPosition()
            .then(pos => mode != 0 ? pos[2] : Math.floor(pos[2]));
    };

    connect_p({ip}){
        this.ip = ip;
        var rjm = this;
        return new Promise(function(resolve, reject) {
            if (rjm.socket != null)
                rjm.socket.close();
            rjm.clear();
            rjm.socket = new WebSocket("ws://"+ip+":14711");
            rjm.socket.onopen = function() {                
                resolve();
            };
            rjm.socket.onerror = function(err) {
                reject(err);
            };
        }).then(result => rjm.getPosition().then( result => {
            rjm.turtle.pos = result;
        })).then (result => rjm.getRotation().then( result => {
            rjm.playerRot = result;
            rjm.turtle.matrix = rjm.turtle.yawMatrix(Math.floor(0.5+result/90)*90);
        }));
    };
    
    chat({msg}){
        this.socket.send("chat.post("+msg+")");
    };
    
    getLine(x1,y1,z1,x2,y2,z2) {
        var line = [];
        x1 = Math.floor(x1);
        y1 = Math.floor(y1);
        z1 = Math.floor(z1);
        x2 = Math.floor(x2);
        y2 = Math.floor(y2);
        z2 = Math.floor(z2);
        var point = [x1,y1,z1];
        var dx = x2 - x1;
        var dy = y2 - y1;
        var dz = z2 - z1;
        var x_inc = dx < 0 ? -1 : 1;
        var l = Math.abs(dx);
        var y_inc = dy < 0 ? -1 : 1;
        var m = Math.abs(dy);
        var z_inc = dz < 0 ? -1 : 1;
        var n = Math.abs(dz);
        var dx2 = l * 2;
        var dy2 = m * 2;
        var dz2 = n * 2;
        
        var nib = this.turtle.nib;
        
        var draw = function(x,y,z) {
            for (var i=0; i<nib.length; i++) {
                var nx = x + nib[i][0];
                var ny = y + nib[i][1];
                var nz = z + nib[i][2];
                var j;
                for (j=0; j<line.length; j++) {
                    if (line[j][0] == nx && line[j][1] == ny && line[j][2] == nz)
                        break;
                }
                if (j<line.length)
                    continue;
                line.push([nx,ny,nz]);
            }
        };

        if (l >= m && l >= n) {
            var err_1 = dy2 - l;
            var err_2 = dz2 - l;
            for (var i=0; i<l; i++) {
                draw(point[0],point[1],point[2]);
                if (err_1 > 0) {
                    point[1] += y_inc;
                    err_1 -= dx2;
                }
                if (err_2 > 0) {
                    point[2] += z_inc;
                    err_2 -= dx2;
                }
                err_1 += dy2;
                err_2 += dz2;
                point[0] += x_inc;
            }
        }
        else if (m >= l && m >= n) {
            err_1 = dx2 - m;
            err_2 = dz2 - m;
            for (var i=0; i<m; i++) {
                draw(point[0],point[1],point[2]);
                if (err_1 > 0) {
                    point[0] += x_inc;
                    err_1 -= dy2;
                }
                if (err_2 > 0) {
                    point[2] += z_inc;
                    err_2 -= dy2;
                }
                err_1 += dx2;
                err_2 += dz2;
                point[1] += y_inc;
            }
        }
        else {
            err_1 = dy2 - n;
            err_2 = dx2 - n;
            for (var i=0; i < n; i++) {
                draw(point[0],point[1],point[2]);
                if (err_1 > 0) {
                    point[1] += y_inc;
                    err_1 -= dz2;
                }
                if (err_2 > 0) {
                    point[0] += x_inc;
                    err_2 -= dz2;
                }
                err_1 += dy2;
                err_2 += dx2;
                point[2] += z_inc;
            }
        }
        draw(point[0],point[1],point[2]);
        if (point[0] != x2 || point[1] != y2 || point[2] != z2) {
            draw(x2,y2,z2);
        }
        return line;
    };
    
    setBlock({x,y,z,b}) {
      var [x,y,z] = this.parseXYZ(x,y,z).map(Math.floor);
      this.drawBlock(x,y,z,b);
    };

    setPlayerPos({x,y,z}) {
      var [x,y,z] = this.parseXYZ(x,y,z);
      this.socket.send("player.setPos("+x+","+y+","+z+")");
    };
}

(function() {
    var extensionClass = RaspberryJamMod
    if (typeof window === "undefined" || !window.vm) {
        Scratch.extensions.register(new extensionClass())
    }
    else {
        var extensionInstance = new extensionClass(window.vm.extensionManager.runtime)
        var serviceName = window.vm.extensionManager._registerInternalExtension(extensionInstance)
        window.vm.extensionManager._loadedExtensions.set(extensionInstance.getInfo().id, serviceName)
    }
})()
