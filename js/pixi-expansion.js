(function(){
    PIXI.customUpdateList = [];
    PIXI.customBeforeUpdateList = [];
    /*PIXI.DisplayObject.prototype = {
        aaa: {}
    };*/
    /*function aabvb(){

    }
    Object.defineProperty(aabvb.prototype, 'aaa', {
        value: {},
        writable: true,
        configurable: true,
        enumerable: false, // 設定 hello 為不可列舉的屬性
    });
    var temp0 = new aabvb();
    temp0.aaa["aa"] = 10;
    console.log(temp0.aaa);
    var temp1 = new aabvb();
    console.log(temp1.aaa);
    PIXI.DisplayObject.prototype.aaa = {};*/
    //console.log(PIXI.DisplayObject.prototype)
    PIXI.DisplayObject.prototype = Object.assign(PIXI.DisplayObject.prototype, {            
        //body:null,
        createBody:function(type, option, bound){
            option = option||{};
            if(type==="rect"){
                if(bound){
                    bound = bound||{};
                    bound.left = bound.left||0;
                    bound.right = bound.right||0;
                    bound.top = bound.top||0;
                    bound.bottom = bound.bottom||0;
                    this.body=Bodies.rectangle(0,0,this.width-bound.left-bound.right,this.height-bound.top-bound.bottom,option,false); 
                    this.pivot.set((bound.left- bound.right)*0.5, (bound.top - bound.bottom)*0.5);
                }else{
                    this.body=Bodies.rectangle(0,0,this.width,this.height,option,false);
                }     
            }else if(type==="circle"){
                this.body=Bodies.circle(0,0,this.width*0.5,option);
                //this.pivot.set(this.width*0.5, this.height*0.5);
                /*this.pivot.set((bound.left- bound.right)*0.5, (bound.top - bound.bottom)*0.5);*/
            }
                        
            return this;
        },
        addBodyfrom:function(target){
            PIXI.customUpdateList.push(this);
            World.add(target,this.body);
            return this;
        },
        removeBodyfrom:function(target){
            var that = this;
            var index = PIXI.customUpdateList.findIndex(function(el){
                return el===that
            });
            if(index!==-1){
                PIXI.customUpdateList.splice(index, 1);
                World.remove(target,this.body); 
                this.body = undefined;
                delete this.body;
            }
            return this;
        },
        customUpdate:function(){
            //console.log('aaa')
            if(this.body){  
                this.position = this.body.position;
                this.rotation = this.body.angle;
            }
            var pos = this.getGlobalPosition();
            this.setVisible(pos.x > -800 && pos.x < 800*2);
            return this;
        },
        setVisible:function(bool){
            if(this.visibleFun){
                this.visible = this.visibleFun(bool)?true:false;
            }else{
                this.visible = bool;
            }
        },
        customBeforeUpdate:function(delta){
            //console.log(delta,this.animationList[0]);
            if(this.animationList){
                this.animationList.forEach(function(el){                
                        el.run(delta);
                    });
            }
        },     
        setPosition:function(x, y){
            if(this.body){
                Body.setPosition(this.body, {x:x,y:y});
            }
            return this;              
        },      
        translate:function(x, y){
            if(this.body){
                Body.translate(this.body,{x: x, y: y});
            }
            return this;              
        },
        rotate:function(angle, point){
            if(this.body){
                Body.rotate(this.body, angle, point)
            }
            return this;              
        },
        move:function(x, y){
            if(this.body){
                Body.setPosition(this.body, {x:this.body.position.x + x,y:this.body.position.y + y});
                Body.setVelocity(this.body, {x:x,y:y});
            }
            return this;  
        },
        addAnimation:function(name, duration, loop, fun){
            if(!this.animationList){
                this.animationList = [];
            }
            var that = this;
            var temp = new animation(name, duration, loop, function(rate, data){
                fun(that, rate, data);
            });
            var index = PIXI.customBeforeUpdateList.findIndex(function(el){
                return that===el;
            });
            if(index===-1){
                PIXI.customBeforeUpdateList.push(this);
            }
            this.animationList.push(temp);
            return temp;
        },
        getAnimation:function(name){
            if(this.animationList){
                var index = this.animationList.findIndex(function(el){
                    return name===el.name;
                });
                if(index!==-1){
                    return this.animationList[index];
                }
            }
        },
        animationPlay:function(name){
            var animation01 = this.getAnimation(name);
            if(animation01){
                animation01.play();
            }
        }
    });
    var AnimatedSprite_gotoAndPlay = PIXI.AnimatedSprite.prototype.gotoAndPlay;
    var AnimatedSprite_gotoAndStop = PIXI.AnimatedSprite.prototype.gotoAndStop;
    var AnimatedSprite_render = PIXI.AnimatedSprite.prototype._render;
    //PIXI.AnimatedSprite.prototype.aaa = 'asdasd';
    PIXI.AnimatedSprite.prototype = Object.assign(PIXI.AnimatedSprite.prototype, {
        initTags:function(){
            this.frameTags = {};
            this.currentlyTag = 0;
        },
        gotoAndPlay:function(t){
            if(!this.frameTags||typeof(t)==='number'){
                this.currentlyTag = t;
                //this.animationSpeed = 1;
                AnimatedSprite_gotoAndPlay.call(this,t);
                return;
            }
            var tag = this.frameTags[t];
            if(tag){
                this.currentlyTag = t;
                this.animationSpeed = tag.speed;
                AnimatedSprite_gotoAndPlay.call(this,tag.start);
            }      
        },
        gotoAndStop:function(t){
            if(!this.frameTags||typeof(t)==='number'){
                this.currentlyTag = t;
                //this.animationSpeed = 1;
                AnimatedSprite_gotoAndStop.call(this,t);
                return;
            }
            var tag = this.frameTags[t];
            if(tag){
                this.currentlyTag = t;
                this.animationSpeed = tag.speed;
                AnimatedSprite_gotoAndStop.call(this,tag.start);
            }
        },
        changeFrame:function(){
            if(this.frameTags){
                var tag = this.frameTags[this.currentlyTag];
                if(tag){
                    if(tag.loop){
                        var f = tag.start + (this.currentFrame-tag.start)%(tag.end-tag.start);               
                        if(this.currentFrame!==f){
                            AnimatedSprite_gotoAndPlay.call(this,f);
                        }
                    }else{
                        if(this.currentFrame>=tag.end){
                            AnimatedSprite_gotoAndStop.call(this,tag.end);
                        }
                    }
                } 
            }                   
        },
        _render:function(t){
            AnimatedSprite_render.call(this,t);
            this.changeFrame();
        }
    });
    

    PIXI.componentCharacter = function(data) {
        this.__super(); 
        PIXI.customBeforeUpdateList.push(this);
        var player = new PIXI.AnimatedSprite(data);
        player.scale.set(1);
        player.initTags();
        player.frameTags['idle'] = {start:0,end:23,loop:true,speed:0.4};
        player.frameTags['run'] = {start:24,end:47,loop:true,speed:1.4};
        player.frameTags['jumpBefore'] = {start:48,end:61,loop:false,speed:1.2};
        player.frameTags['jump'] = {start:62,end:71,loop:false,speed:0.8};
        player.frameTags['fall'] = {start:72,end:95,loop:true,speed:0.8};
        /*player.animationSpeed = 0.75;*/
        this.player = player;
        this.addChild(this.player);

        this.sensorLeftBool = false;
        this.sensorRightBool = false;
        this.sensorFloorBool = false;
        this.direction = 'right';
        this.jumpLock = false;
        this.controlLeft = false;
        this.controlRight = false;
        this.controlJump = false;
        //this.parts = [];

        var that = this;
        var stateMachine01 = new stateMachine();
        stateMachine01.addState('',{
            trigger:function(){
                if(that.sensorFloorBool){
                    this.setState('base');
                }else{                
                    this.setState('fall');
                }
            }
        });

        stateMachine01.addState('base',{
            trigger:function(){   
                if(!that.jumpLock&&that.sensorFloorBool&&that.controlJump){
                    this.setState('jumpBefore');          
                }
                if(that.jumpLock&&!that.controlJump){
                    that.jumpLock = false;
                }
                if(!that.sensorFloorBool&&that.body.velocity.y>=1){
                    this.setState('fall');
                }
            },
            input:function(from, to){
                to.stateMachine.setState('idle');
            },
            nav:['jumpBefore','fall']
        });
        var stateMachine01_base = stateMachine01.activeSubStateMachine('base');
        stateMachine01_base.addState('idle',{
            trigger:function(){
                if(that.controlLeft||that.controlRight){                
                    this.setState('run'); 
                }
            },
            input:function(){
                that.player.gotoAndPlay('idle');
            },
            nav:['run']
        });
        stateMachine01_base.addState('run',{
            trigger:function(){
                if(!that.controlLeft&&!that.controlRight){                
                    this.setState('idle'); 
                }
                if(that.controlLeft){
                    that.controlMove(!that.sensorLeftBool?1:0.03);
                }else if(that.controlRight){
                    that.controlMove(!that.sensorRightBool?1:0.03);
                }
            },
            input:function(){                
                that.player.gotoAndPlay('run');
            },
            nav:['idle']
        });

        stateMachine01.addState('jumpBefore',{
            trigger:function(state){
                if(that.controlLeft){
                    that.controlMove(!that.sensorLeftBool?0.7:0);
                }else if(that.controlRight){
                    that.controlMove(!that.sensorRightBool?0.7:0);
                }
                if(that.player.currentFrame>=player.frameTags[state.id].end){                
                    this.setState('jump');
                }
            },
            input:function(){
                that.jumpLock = true;
                that.player.gotoAndPlay('jumpBefore');
            },
            enter:function(){
                return that.sensorFloorBool;
                return false;
            },
            nav:['jump']
        });

        stateMachine01.addState('jump',{
            trigger:function(state){
                if(that.controlLeft){
                    that.controlMove(!that.sensorLeftBool?0.1:0);
                }else if(that.controlRight){
                    that.controlMove(!that.sensorRightBool?0.1:0);
                }
                if(that.body.velocity.y>0){
                    this.setState('fall');
                }
                if(that.sensorFloorBool){
                    this.setState('base');
                }
                //console.log(that.player.currentFrame,player.frameTags[state.id].end);
                if(!that.controlJump){
                    var v = that.body.velocity;
                    v.y *= 0.96;
                    Body.setVelocity(that.body, v);         
                }
            },
            input:function(){
                that.player.gotoAndPlay('jump');
                var f = that.body.mass*0.04;
                Body.applyForce(that.body,that.body.position, {x: 0, y: -f});  
            },
            nav:['fall','base']
        });

        stateMachine01.addState('fall',{
            trigger:function(){
                if(that.controlLeft){
                    that.controlMove(!that.sensorLeftBool?0.03:0);
                }else if(that.controlRight){
                    //console.log(that.body.velocity.x,!that.sensorRightBool?0.03:0);
                    that.controlMove(!that.sensorRightBool?0.03:0);
                }
                if(that.sensorFloorBool){
                    if(!that.controlJump){
                        that.jumpLock = false;
                    }
                    this.setState('base');
                }
            },
            input:function(){
                that.player.gotoAndPlay('fall');
            },
            nav:['base']
        });

        

        this.stateMachine = stateMachine01;
        this.init = function(){
            this.jumpLock = false;
            this.controlLeft = false;
            this.controlRight = false;
            this.controlJump = false;
            /*this.sensorLeftBool = false;
            this.sensorRightBool = false;
            this.sensorFloorBool = false;*/
            this.setDirection("right"); 
            this.stateMachine.init();
            this.stateMachine.setState("base");
            Body.setVelocity(this.body, {x:0,y:0});
            /*var temp = Matter.Detector.collisions(this.sensorFloor,engine);
            console.log(temp,this.body.parts,engine,this.sensorFloor.parts);*/
        }
        this.createBody = function(dimension,option){
            dimension = Object.assign({
                head: 40,
                bodyWidth: 60,
                bodyHeight: 120,
                footRadius: 15,
                footDistance: 20
            },dimension);
            var bodiesBodyBottom = -dimension.bodyWidth*0.5;
            var bodiesBodyTop = -dimension.bodyHeight+dimension.bodyWidth*0.5+dimension.head*0.5;
            var bodiesBodyY = (bodiesBodyTop + bodiesBodyBottom)*0.5;

            var bodiesHead = Bodies.rectangle(0,-dimension.bodyHeight+dimension.head*0.5,dimension.head,dimension.head);
            var bodiesLeftFoot = Bodies.circle(0+dimension.footDistance*0.5,-dimension.footRadius,dimension.footRadius);
            var bodiesRightFoot = Bodies.circle(0-dimension.footDistance*0.5,-dimension.footRadius,dimension.footRadius);
            var bodiesBody = Bodies.circle(0,bodiesBodyY,dimension.bodyWidth*0.5);
            var tt = -dimension.bodyHeight;
            var bb = -dimension.footRadius;
            
            var sensorLeft = Bodies.rectangle(0-dimension.bodyWidth*0.5+dimension.bodyWidth*0.1,(bb+tt)*0.5,dimension.bodyWidth*0.5,bb-tt-dimension.footRadius,{isSensor:true,density:0});                
            var sensorRight = Bodies.rectangle(0+dimension.bodyWidth*0.5-dimension.bodyWidth*0.1,(bb+tt)*0.5,dimension.bodyWidth*0.5,bb-tt-dimension.footRadius,{isSensor:true,density:0});                
            var sensorFloor = Bodies.rectangle(0,-dimension.footRadius+dimension.footRadius*1,dimension.footDistance+dimension.footRadius*2*0.5,dimension.footRadius,{isSensor:true,density:0});
            this.sensorFloor = sensorFloor;
            //console.log(sensorFloor);
            var sensorCollision = Bodies.circle(0,-dimension.bodyHeight*0.5,dimension.bodyWidth*0.7,{collisionGroup:1,isSensor:true,density:0});

            var that = this;

            Engine.collision.addCollisionStart(sensorCollision,function(body){
                    if(body.data){
                        if(body.data.collision){
                            body.data.collision();
                        }
                    }
                });
            function collisionToBool(sensor, fun, judge){
                var sensorCount = 0;
                var updateCollision = function(body){
                    fun(body,sensorCount>0);
                }
                Engine.collision.addCollisionStart(sensor,function(body){
                        if(!judge||judge(body)){
                            sensorCount++;
                            updateCollision(body);
                        }
                    });
                Engine.collision.addCollisionEnd(sensor,function(body){
                        if(!judge||judge(body)){                        
                            sensorCount--;
                            updateCollision(body);
                        }
                    });
            }
            collisionToBool(sensorLeft,function(body,bool){            
                that.sensorLeftBool = bool;
            });
            collisionToBool(sensorRight,function(body,bool){
                that.sensorRightBool = bool;
            });
            collisionToBool(sensorFloor,function(body,bool){
                that.sensorFloorBool = bool;
            });
            Engine.collision.addCollisionEnd(bodiesHead,function(body){
                if(that.sensorLeftBool){
                    Body.translate( that.body, {x:1,y:0});
                }
                if(that.sensorRightBool){
                    Body.translate( that.body, {x:-1,y:0});
                }
            });
            Engine.collision.addCollisionEnd(bodiesBody,function(body){
                if(that.sensorLeftBool){
                    Body.translate( that.body, {x:1,y:0});
                }
                if(that.sensorRightBool){
                    Body.translate( that.body, {x:-1,y:0});
                }
            });

            option = Object.assign({
                friction: 0.5,
                /*frictionStatic: 0,*/
                /*frictionAir: 0,*/    
                inertia: Infinity,
                restitution: 0.03,
                parts:[bodiesHead,bodiesLeftFoot,bodiesRightFoot,bodiesBody,sensorLeft,sensorRight,sensorFloor,sensorCollision]
            },option);

            var bodiesMain=Body.create(option);
            bodiesMain.position.x = 0;
            bodiesMain.position.y = 0;
            bodiesMain.positionPrev.x = 0;
            bodiesMain.positionPrev.y = 0;
            this.body=bodiesMain;
            return this;
        }
        this.customBeforeUpdate = function(delta){
            this.constructor.prototype.customBeforeUpdate.call(this,delta);    
            this.stateMachine.stateTrigger();
        }
        this.setDirection = function(direction){
            //console.log(direction)
            if(direction==='left'){
                this.direction=direction;
                this.player.scale.set(-Math.abs(this.player.scale.x),this.player.scale.y);
            }else if(direction==='right'){
                this.direction=direction;
                this.player.scale.set(Math.abs(this.player.scale.x),this.player.scale.y);
            }
            return this;
        }
        this.controlMove = function(s){
            if(this.controlLeft){
                if(this.direction!=='left'){
                    this.direction='left';
                    this.setDirection(this.direction);
                }else if(!this.sensorLeftBool){
                    var v = this.body.velocity;
                    if(v.x<-8){
                        v.x *= 0.5;
                        Body.setVelocity(this.body, v);
                    }
                    //var v = this.body.velocity;
                    var temp = 1-Math.max(0, Math.min(1, v.x/(-8)));
                    var f = this.body.mass*0.008*temp;
                    Body.applyForce(this.body,this.body.position, {x: -s*f, y: 0});        
                }                      
            }
            if(this.controlRight){
                if(this.direction!=='right'){
                    this.direction='right';
                    this.setDirection(this.direction);
                }else if(!this.sensorRightBool){
                    var v = this.body.velocity;
                    if(v.x<-8){
                        v.x *= 0.5;
                        Body.setVelocity(this.body, v);
                    }
                    //var v = this.body.velocity;
                    var temp = 1-Math.max(0, Math.min(1, v.x/(8)));
                    var f = this.body.mass*0.008*temp;
                    Body.applyForce(this.body,this.body.position, {x: s*f, y: 0});               
                }
            }
        }
    }
    extend(PIXI.componentCharacter, PIXI.Container);
})();