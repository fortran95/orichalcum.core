module.exports = {
    
    _queue: [{}, {}],

    _queueOperate: function(type, queueName, value){
        if(value != undefined)
            if(this._queue[type][queueName] == undefined)
                this._queue[type][queueName] = [value, ];
            else
                this._queue[type][queueName].append(value);
        else
            if(this._queue[type][queueName] == undefined)
                return null;
            else
                return this._queue[type][queueName].pop();
    },

    send: function(serviceName, value){
        return this._queueOperate(0, serviceName, value);
    },

    receive: function(serviceName, value){
        return this._queueOperate(1, serviceName, value);
    },

};
