class User {
    constructor(ip, connect) {
      this.ip = ip;
      this.connect = connect;
      this.unload = null;
      this.actions = [];
    }
  
    setUnload(unload) {
      this.unload = unload;
    }

    addToActions(data){
        this.actions.push(data);
    }
  
    displayUser() {
      console.log(`IP Address: ${this.ip}`);
      console.log(`Connection Date: ${this.connect}`);
      console.log(`Window Close Date: ${this.unload}`);
    }
}
module.exports = User;