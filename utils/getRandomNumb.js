export default () => {
  let number = ""
  for (let i = 0; i < 5; i++) {
    let elem = Math.floor(Math.random() * 10)
    number += elem
  }
  return number
}
