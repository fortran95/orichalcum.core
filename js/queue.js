module.exports = function(){
    var self = this;
    x.nodejs.events.EventEmitter.call(this);

    this._queue = {
        'send': [], 
        'receive': []
    };

    this._queueOperate = function(type, value){
        if(value != undefined){
//            self.emit(type);
            self._queue[type].push(value);
        } else
            return self._queue[type].shift();
    };

    this.send = function(value){
        return self._queueOperate('send', value);
    };

    this.receive = function(value){
        return this._queueOperate('receive', value);
    };

    this.countSend = function(){return self._queue['send'].length;};
    this.countReceive = function(){return self._queue['receive'].length;};
};
