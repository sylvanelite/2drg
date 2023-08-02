
const IMAGE_WIDTH=512;
const IMAGE_HEIGHT=512;
const sprites = {
    driller_stand1:{
        x:0*8,y:0*8,//coordinates in source image 
        w:8,h:8
    }, driller_jet1:{
        x:1*8,y:0*8,
        w:8,h:8
    }, driller_fall1:{
        x:2*8,y:0*8,
        w:8,h:8
    },heart:{
        x:3*8,y:0*8,
        w:8,h:8
    },carry:{
        x:4*8,y:0*8,
        w:8,h:8
    },ammo:{
        x:5*8,y:0*8,
        w:8,h:8
    },
    driller_stand2:{
        x:0*8,y:1*8,
        w:8,h:8
    }, driller_jet2:{
        x:1*8,y:1*8,
        w:8,h:8
    }, driller_fall2:{
        x:2*8,y:1*8,
        w:8,h:8
    },
    scout_stand1:{
        x:0*8,y:2*8,
        w:8,h:8
    }, scout_jet1:{
        x:1*8,y:2*8,
        w:8,h:8
    }, scout_fall1:{
        x:2*8,y:2*8,
        w:8,h:8
    },
    scout_stand2:{
        x:0*8,y:3*8,
        w:8,h:8
    }, scout_jet2:{
        x:1*8,y:3*8,
        w:8,h:8
    }, scout_fall2:{
        x:2*8,y:3*8,
        w:8,h:8
    },
    engineer_stand1:{
        x:0*8,y:4*8,
        w:8,h:8
    }, engineer_jet1:{
        x:1*8,y:4*8,
        w:8,h:8
    }, engineer_fall1:{
        x:2*8,y:4*8,
        w:8,h:8
    },
    engineer_stand2:{
        x:0*8,y:5*8,
        w:8,h:8
    }, engineer_jet2:{
        x:1*8,y:5*8,
        w:8,h:8
    }, engineer_fall2:{
        x:2*8,y:5*8,
        w:8,h:8
    },
    gunner_stand1:{
        x:0*8,y:6*8,
        w:8,h:8
    }, gunner_jet1:{
        x:1*8,y:6*8,
        w:8,h:8
    }, gunner_fall1:{
        x:2*8,y:6*8,
        w:8,h:8
    },
    gunner_stand2:{
        x:0*8,y:7*8,
        w:8,h:8
    }, gunner_jet2:{
        x:1*8,y:7*8,
        w:8,h:8
    }, gunner_fall2:{
        x:2*8,y:7*8,
        w:8,h:8
    },
    egg:{
        x:0*8,y:8*8,
        w:8,h:8
    },
    aquarq:{
        x:1*8,y:8*8,
        w:8,h:8
    },
    fossil:{
        x:0*8,y:9*8,
        w:8,h:8
    },
    bismore_top:{
        x:0*8,y:10*8,
        w:8,h:8
    },
    croppa_top:{
        x:1*8,y:10*8,
        w:8,h:8
    },
    bismore_bottom:{
        x:0*8,y:11*8,
        w:8,h:8
    },
    croppa_bottom:{
        x:1*8,y:11*8,
        w:8,h:8
    },
    nitra_top:{
        x:0*8,y:12*8,
        w:8,h:8
    },
    red_sugar_top:{
        x:1*8,y:12*8,
        w:8,h:8
    },
    gold_top:{
        x:2*8,y:12*8,
        w:8,h:8
    },
    nitra_bottom:{
        x:0*8,y:13*8,
        w:8,h:8
    },
    red_sugar_bottom:{
        x:1*8,y:13*8,
        w:8,h:8
    },
    gold_bottom:{
        x:2*8,y:13*8,
        w:8,h:8
    },
    player1:{
        x:24*0,y:14*8,
        w:24,h:50
    },
    player2:{
        x:24*1,y:14*8,
        w:24,h:50
    },
    player3:{
        x:24*2,y:14*8,
        w:24,h:50
    },
    player4:{
        x:24*3,y:14*8,
        w:24,h:50
    }
};

const FONT_WIDTH = 128;
const FONT_HEIGHT = 64;
const LETTER_W = 7;const W = LETTER_W;
const LETTER_H = 9;const H = LETTER_H;
const font = {
    ' ':{x: 0*W,y: 0*H},
    '!':{x: 1*W,y: 0*H},
    '"':{x: 2*W,y: 0*H},
    '#':{x: 3*W,y: 0*H},
    '$':{x: 4*W,y: 0*H},
    '%':{x: 5*W,y: 0*H},
    '&':{x: 6*W,y: 0*H},
    "'":{x: 7*W,y: 0*H},
    '(':{x: 8*W,y: 0*H},
    ')':{x: 9*W,y: 0*H},
    '*':{x:10*W,y: 0*H},
    '+':{x:11*W,y: 0*H},
    ',':{x:12*W,y: 0*H},
    '-':{x:13*W,y: 0*H},
    '.':{x:14*W,y: 0*H},
    '/':{x:15*W,y: 0*H},
    '0':{x:16*W,y: 0*H},
    '1':{x:17*W,y: 0*H},
    //--
    '2':{x: 0*W,y: 1*H},
    '3':{x: 1*W,y: 1*H},
    '4':{x: 2*W,y: 1*H},
    '5':{x: 3*W,y: 1*H},
    '6':{x: 4*W,y: 1*H},
    '7':{x: 5*W,y: 1*H},
    '8':{x: 6*W,y: 1*H},
    "9":{x: 7*W,y: 1*H},
    ':':{x: 8*W,y: 1*H},
    ';':{x: 9*W,y: 1*H},
    '<':{x:10*W,y: 1*H},
    '=':{x:11*W,y: 1*H},
    '>':{x:12*W,y: 1*H},
    '?':{x:13*W,y: 1*H},
    '@':{x:14*W,y: 1*H},
    'A':{x:15*W,y: 1*H},
    'B':{x:16*W,y: 1*H},
    'C':{x:17*W,y: 1*H},
    //--
    'D':{x: 0*W,y: 2*H},
    'E':{x: 1*W,y: 2*H},
    'F':{x: 2*W,y: 2*H},
    'G':{x: 3*W,y: 2*H},
    'H':{x: 4*W,y: 2*H},
    'I':{x: 5*W,y: 2*H},
    'J':{x: 6*W,y: 2*H},
    "K":{x: 7*W,y: 2*H},
    'L':{x: 8*W,y: 2*H},
    'M':{x: 9*W,y: 2*H},
    'N':{x:10*W,y: 2*H},
    'O':{x:11*W,y: 2*H},
    'P':{x:12*W,y: 2*H},
    'Q':{x:13*W,y: 2*H},
    'R':{x:14*W,y: 2*H},
    'S':{x:15*W,y: 2*H},
    'T':{x:16*W,y: 2*H},
    'U':{x:17*W,y: 2*H},
    //--
    'V':{x: 0*W,y: 3*H},
    'W':{x: 1*W,y: 3*H},
    'X':{x: 2*W,y: 3*H},
    'Y':{x: 3*W,y: 3*H},
    'Z':{x: 4*W,y: 3*H},
    '[':{x: 5*W,y: 3*H},
   '\\':{x: 6*W,y: 3*H},
    "]":{x: 7*W,y: 3*H},
    '^':{x: 8*W,y: 3*H},
    '_':{x: 9*W,y: 3*H},
    '`':{x:10*W,y: 3*H},
    'a':{x:11*W,y: 3*H},
    'b':{x:12*W,y: 3*H},
    'c':{x:13*W,y: 3*H},
    'd':{x:14*W,y: 3*H},
    'e':{x:15*W,y: 3*H},
    'f':{x:16*W,y: 3*H},
    'g':{x:17*W,y: 3*H},
    //--
    'h':{x: 0*W,y: 4*H},
    'i':{x: 1*W,y: 4*H},
    'j':{x: 2*W,y: 4*H},
    'k':{x: 3*W,y: 4*H},
    'l':{x: 4*W,y: 4*H},
    'm':{x: 5*W,y: 4*H},
    'n':{x: 6*W,y: 4*H},
    "o":{x: 7*W,y: 4*H},
    'p':{x: 8*W,y: 4*H},
    'q':{x: 9*W,y: 4*H},
    'r':{x:10*W,y: 4*H},
    's':{x:11*W,y: 4*H},
    't':{x:12*W,y: 4*H},
    'u':{x:13*W,y: 4*H},
    'v':{x:14*W,y: 4*H},
    'w':{x:15*W,y: 4*H},
    'x':{x:16*W,y: 4*H},
    'y':{x:17*W,y: 4*H},
    //--
    'z':{x: 0*W,y: 5*H},
    '{':{x: 1*W,y: 5*H},
    '|':{x: 2*W,y: 5*H},
    '}':{x: 3*W,y: 5*H},
    '“':{x: 4*W,y: 5*H},
};

export {IMAGE_HEIGHT,IMAGE_WIDTH,sprites,FONT_HEIGHT,FONT_WIDTH,LETTER_H,LETTER_W,font};