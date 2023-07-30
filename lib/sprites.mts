
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

export {IMAGE_HEIGHT,IMAGE_WIDTH,sprites};