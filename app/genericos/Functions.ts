import zlib from  'zlib';
import atob  from 'atob';

export abstract  class Functions{

public static  toArrayBuffer(buffer) {
        var arrayBuffer = new ArrayBuffer(buffer.length);
        var view = new Uint8Array(arrayBuffer);
        for (var i = 0; i < buffer.length; ++i) {
          view[i] = buffer[i];
        }
        return arrayBuffer;
}
    
public static unzipString(stringZip){
    
    var b64Data     = stringZip;
    
    var strData     = atob.atob(b64Data);
    
    var charData    = strData.split('').map(function(x){return x.charCodeAt(0);});
    
    var binData     = new Uint8Array(charData);
    
    var arrayBuffer =  this.toArrayBuffer(binData);
  
    return zlib.unzipSync(Buffer.from(arrayBuffer, 4)).toString();
}

public static toDate(dateStr) {
      const [day, month, year] = dateStr.split("/")
      return new Date(year, month - 1, day)
    }

public static zipString(stringZip){

   var buf = Buffer.from(JSON.stringify(stringZip));

    return zlib.gzipSync(buf);   
}  

public static isNullOrEmpty(string) {
  if((string === undefined) || (string.length <= 0)) 
    return true;
return false;
}   

public static isValidDate(dt) {
  return !!new Date(dt).getFullYear();
} 

}

