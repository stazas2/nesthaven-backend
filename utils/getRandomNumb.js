const rand = function getRandomInt() {
   let number = ''
   for ( let i = 0; i < 5; i++ ){
       let elem = Math.floor(Math.random()*10)
       number += elem
   }
   return number
}

export default rand