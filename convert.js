var fs = require('fs');
module.exports=function(file,cb){
  fs.readFile(file,{encoding:'utf8'},function(err,data){
    if(err){
      return cb(err);
    }
    cb(null,deal(data));
  });
};
function deal(file){
  var list = file.split('\n');
  var name = list.shift();
  var split = list.map(function(line){
    return line.split(' ').filter(function(a){
      return a.trim();
    });
  });
  var params = dealTop(split.shift());
  var out = {};
  out.ll = [params.lowleft_longitude,params.lowleft_latitude];
  out.del = [params.resolution_longitude,params.resolution_latitude];
  out.lim = [params.grid_size_x,params.grid_size_y];
  out.csv = dealRest(split).map(toPair);
  return [name,out];
}
function dealTop(topRow){
  var names = ['grid_size_x','grid_size_y','ignore','lowleft_longitude','resolution_longitude','lowleft_latitude','resolution_latitude'];
  var out = {};
  names.forEach(function(v,i){
    out[v]=topRow[i];
  });
  return out;
}
function dealRest(lines){
  var thing = {};
  thing.out=[];
  thing.number=0;
  thing.sofar = [];
  var reduced = lines.reduce(reducer,thing);
  reduced.out[reduced.number] = reduced.sofar;
  return reduced.out;
}

function reducer(a,b){
  var curNum;
  if(b[0].indexOf(':')>-1){
    curNum = parseInt(b.shift().slice(0,-1),10);
    if(typeof curNum === 'number' && curNum !== 0){
      a.out[a.number]=a.sofar;
    }
    a.number = curNum;
    a.sofar = [];
  }else{
    curNum = a.number;
  }
  a.sofar = a.sofar.concat(b);
  return a;
}

function toPair(line){
  return line.reduce(function(a,b){
    if(a.x){
      a.done.push([a.x,b]);
      a.x = false;
    }else{
      b = a.x;
    }
  },{x:false,done:[]}).done;
}