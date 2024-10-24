/*
*
Trabalho realizado por: Diogo Rosa nº57464, Filipe Santo nº58388
*
*/

import {loadShadersFromURLS, setupWebGL,buildProgramFromSources } from "../../libs/utils.js"
import * as MV from "../../libs/MV.js";

/** @type {WebGLRenderingContext} */

//Constant's
const TABLE_WIDTH = 3.0;
const GRID_SPACING = 0.05;
const MAX_CHARGES = 50;
const VEL_INCREMENT = 0.005;
const VEL_START = 0.005;
const VEL_LIMIT = 0.05;

//vars's
var movVal;
var lastMovVal;
var tableHeight;
var totalProtons;
var totalElectrons;
var chargeOpacity;

//Locations var's
var opacityLoc;
var colorLoc;
var chargeTabWidthLoc;
var chargeTabHeightLoc;
var gridTabWidthLoc;
var gridTabHeightLoc;
var numElectronsLoc;
var numProtonsLoc;

//programs and webgl
var chargesProg;
var gridProg;
var gl;


//Buffers
var aBuffer;
var bBuffer;

//Arrays
const grid = [];
const electronPos = [];
const protonPos = [];
const chargeLog = [];


function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
}

function setup(shaders)
{
    //Setup
    const canvas = document.getElementById("gl-canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    //Initialize var's
    totalElectrons = 0;
    totalProtons = 0;
    chargeOpacity = 1.0;
    movVal = VEL_START;

    gl = setupWebGL(canvas);
    
    //Transparency of the charges
    gl.enable(gl.BLEND);    
    gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);

    tableHeight = (canvas.height*TABLE_WIDTH)/canvas.width;

    //Create program's
    chargesProg = buildProgramFromSources(gl, shaders["charge.vert"], shaders["charge.frag"]);
    gridProg = buildProgramFromSources(gl, shaders["grid.vert"], shaders["grid.frag"]);
    

    //Update var's when window is changed
    window.addEventListener("resize", function (event) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        tableHeight = (canvas.height*TABLE_WIDTH)/canvas.width;
        gl.viewport(0, 0, canvas.width, canvas.height);
    });


     //Pass charges shader color, opacity, table width and table height
    colorLoc = gl.getUniformLocation(chargesProg,"color");
    chargeTabWidthLoc = gl.getUniformLocation(chargesProg,"table_width");
    chargeTabHeightLoc = gl.getUniformLocation(chargesProg,"table_height");   
    opacityLoc = gl.getUniformLocation(chargesProg,"opacity");

    //Pass grid shader table width, table height, number of protons and eletrons
    gridTabWidthLoc = gl.getUniformLocation(gridProg,"table_width");
    gridTabHeightLoc = gl.getUniformLocation(gridProg,"table_height");
    numProtonsLoc = gl.getUniformLocation(gridProg,"numProtons");
    numElectronsLoc = gl.getUniformLocation(gridProg,"numElectrons");

    //Add grid points and make the noise between them with random number generator(noise)
    for(let x = -TABLE_WIDTH/2.0; x <= TABLE_WIDTH/2.0;x=Number(Number(x+GRID_SPACING).toFixed(2))) {
        for(let y = -tableHeight/2.0; y <= tableHeight/2.0; y=Number(Number(y+GRID_SPACING).toFixed(2))) {
            let temp = getRandomNumber(-GRID_SPACING/2,GRID_SPACING/2);
            let temp1 = getRandomNumber(-GRID_SPACING/2,GRID_SPACING/2);
            grid.push(MV.vec3(x+temp,y+temp1,0.0));
            grid.push(MV.vec3(x+temp,y+temp1,1,0));
        }
    }

     //Init grid buffer
    aBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, aBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,MV.sizeof['vec3']*grid.length , gl.STATIC_DRAW);
    gl.bufferSubData(gl.ARRAY_BUFFER,0,MV.flatten(grid));
    

    //Init proton's and eletron's buffer
    bBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,MV.sizeof['vec2']*MAX_CHARGES*2 , gl.STATIC_DRAW);
   
    //Setup the viewport
    gl.viewport(0, 0, canvas.width, canvas.height);
    
    //Setup the background
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    document.body.onkeyup = function(e)
    {
        //Change opacity with space
        if(e.code === 'Space'){
            chargeOpacity = chargeOpacity==1.0?chargeOpacity-1.0:chargeOpacity+1.0;
            gl.uniform1f(opacityLoc,chargeOpacity);
        }

        //Stop charges movement or make them move again by pressing Enter
        if(e.code === 'Enter'){
            lastMovVal = movVal==0.0?lastMovVal:movVal;
            movVal = movVal==0.0?lastMovVal:0.0;
        }

        //Accelerate the charges by a constant by pressing ArrowRight
        if(e.code === 'ArrowRight'){
            if(movVal < VEL_LIMIT)
            movVal += VEL_INCREMENT;
        }

        //decelerate the charges by a constant by pressing ArrowLeft
        if(e.code === 'ArrowLeft'){
            if(movVal > VEL_START)
            movVal -= VEL_INCREMENT;
        }

        //Removing charges by pressing D
        if(e.code === 'KeyD' && chargeLog.length > 0){
            let temp = chargeLog.pop();
            if(temp == -1.0){
                totalElectrons--;
                electronPos.pop();
            }
            if(temp == 1.0){
                totalProtons--; 
                protonPos.pop();
            }
        }
    }
    
    //Add charge's
    canvas.addEventListener("click", function(event)
    {
        // Start by getting x and y coordinates inside the canvas element
        const x = (event.offsetX*TABLE_WIDTH)/canvas.width - TABLE_WIDTH/2.0;
        const y = tableHeight/2.0 - (event.offsetY*tableHeight)/canvas.height;
        if(totalElectrons+totalProtons<MAX_CHARGES){
            if (event.shiftKey)
            {
            console.log("Click at (" + x + ", " + y + ") com shift");//insert electron
            addClickPoint(false,bBuffer,x,y);
            }
            else{
            console.log("Click at (" + x + ", " + y + ")");//insert proton
            addClickPoint(true,bBuffer,x,y);
            }
        }else alert("Maximo de cargas atingido("+ MAX_CHARGES+" cargas),apaga algumas cargas utilizando o a tecla D");
    });

    //Call animate first the first time
    animate();
    alert("Seta direita: Acelera as cargas\nSeta esquerda: Desacelera as cargas\nTecla D: Apaga as cargas(da mais recente para a mais antiga)\nEspaço: Esconde as cargas\nEnter: Para o movimento das cargas");
}

function addClickPoint(signal,buffer,x,y){
    var temp = new Float32Array([x,y]);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    if(!signal){
        electronPos.push(temp);
        gl.bufferSubData(gl.ARRAY_BUFFER,totalElectrons*MV.sizeof['vec2'],temp);
        totalElectrons++;  
        chargeLog.push(-1.0);    
    }
    else{
        protonPos.push(temp);
        gl.bufferSubData(gl.ARRAY_BUFFER, MV.sizeof['vec2']*MAX_CHARGES+totalProtons*MV.sizeof['vec2'],temp);
        totalProtons++;
        chargeLog.push(1.0);
    }
}
;
function animate()
{
    window.requestAnimationFrame(animate);

    gl.clear(gl.COLOR_BUFFER_BIT);

    //Bind grid buffer
    gl.bindBuffer(gl.ARRAY_BUFFER,aBuffer);
    
    //Set up the grid points attributes
    const gridPosition  = gl.getAttribLocation(gridProg,"vPosition");
    gl.vertexAttribPointer(gridPosition, 2, gl.FLOAT, false, 12, 0);
    gl.enableVertexAttribArray(gridPosition);
    const movable = gl.getAttribLocation(gridProg,"movable");
    gl.vertexAttribPointer(movable, 1, gl.FLOAT, false, 12, 8); 
    gl.enableVertexAttribArray(movable);
    
    //Using grid program
    gl.useProgram(gridProg);

    //Pass to grid vertex shader protons array locations
    for(let i=0; i<protonPos.length; i++) 
    {
        const protonPosLoc = gl.getUniformLocation(gridProg, "protonPos[" + i + "]");
        gl.uniform2fv(protonPosLoc, MV.flatten(protonPos[i]));
    }

    //Pass to grid vertex shader electrons array locations
    for(let i=0; i<electronPos.length; i++) 
    {
        const electronPosLoc = gl.getUniformLocation(gridProg, "electronPos[" + i + "]");
        gl.uniform2fv(electronPosLoc, MV.flatten(electronPos[i]));
    }

    //Pass to grid shader tablewidth and table height
    gl.uniform1f(gridTabWidthLoc,TABLE_WIDTH);
    gl.uniform1f(gridTabHeightLoc,tableHeight);

    //Pass to grid shader the numbers of protons and eletrons
    gl.uniform1i(numProtonsLoc,totalProtons);
    gl.uniform1i(numElectronsLoc,totalElectrons);
    
    //Draw the lines of the grid
    gl.drawArrays(gl.LINES,0,grid.length);
    

    //Bind charges buffer
    gl.bindBuffer(gl.ARRAY_BUFFER,bBuffer);

    //Set up charges position attribute
    const chargePosition  = gl.getAttribLocation(chargesProg,"vPosition");
    gl.vertexAttribPointer(chargePosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(chargePosition);

    //Using charges program
    gl.useProgram(chargesProg);

    //Pass to charges shader the opacity, table width and table height
    gl.uniform1f(opacityLoc,chargeOpacity);
    gl.uniform1f(chargeTabWidthLoc,TABLE_WIDTH);
    gl.uniform1f(chargeTabHeightLoc,tableHeight);
    
    //Set color of electrons and draw them
    gl.uniform4fv(colorLoc,[1.0,0.0,0.0,1.0]);
    gl.drawArrays(gl.POINTS,0,totalElectrons);

    //Set color of protons and draw them
    gl.uniform4fv(colorLoc,[0.0,1.0,0.0,1.0]);
    gl.drawArrays(gl.POINTS,MAX_CHARGES,totalProtons);


    //Update eletrons position 
    for(let i = 0; i < totalElectrons; i++)
    {
        let temp = electronPos[i][0];
        let a1 = Math.cos(-movVal) * temp ;
        let a2 =  Math.sin(-movVal) * electronPos[i][1];
        electronPos[i][0] = a1-a2;
        electronPos[i][1] = Math.sin(-movVal) * temp + Math.cos(-movVal) * electronPos[i][1];
        gl.bufferSubData(gl.ARRAY_BUFFER,i*MV.sizeof['vec2'],electronPos[i]);
    }

    //Update protons position 
    for(let i = 0; i < totalProtons; i++)
    {
        let temp = protonPos[i][0];
        protonPos[i][0] = Math.cos(movVal) * temp - Math.sin(movVal) * protonPos[i][1];
        protonPos[i][1] = Math.sin(movVal) * temp + Math.cos(movVal) * protonPos[i][1];
        gl.bufferSubData(gl.ARRAY_BUFFER,MV.sizeof['vec2']*MAX_CHARGES+i*MV.sizeof['vec2'],protonPos[i]);
    }
}

loadShadersFromURLS(["charge.vert","charge.frag","grid.vert","grid.frag"]).then(shaders => setup(shaders));