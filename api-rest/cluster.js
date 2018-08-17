var cluster = require('cluster');
var os = require('os');

var cpus = os.cpus();

if(cluster.isMaster){

    // Para cada cpu do Sistema Operacional iniciará um cluster slave
    cpus.forEach( cpu => {
        cluster.fork();
    });

    // Assim que levantar um cluster
    cluster.on('listening', worker => {
        console.log('Cluster conectado ', worker.process.pid);
    });

    // Caso Algum Cluster cair
    cluster.on('exit', worker => {
        console.log('Cluster %d desconectado ', worker.process.pid);
        cluster.fork();
    });

} else{
    
    // Trabalho do cluster Slave em subir o sistema
    require('./index.js')
}