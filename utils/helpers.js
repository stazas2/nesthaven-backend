export const getRandomInt = () => {
  let number = ""
  for (let i = 0; i < 5; i++) {
    let elem = Math.floor(Math.random() * 10)
    number += elem
  }
  return number
}


//todo
//? доделать
export const rangeField = (query, field) => {
  for (let i = 0; i < field.length; i++) {
    if (!(query[field[i] + "From"] || query[field[i] + "To"])) continue

    const fieldFrom = query[field[i] + "From"]
    const fieldTo = query[field[i] + "To"]
  
    console.log(fieldFrom, fieldTo)

    if (fieldFrom && fieldTo) {
      query[field] = { $gte: +fieldFrom, $lte: +fieldTo }
      delete query[field[i] + "From"]
      delete query[field[i] + "To"]
    } else if (fieldFrom) {
      query[field] = { $gte: +fieldFrom }
      delete query[field[i] + "From"]
    } else if (fieldTo) {
      query[field] = { $lte: +fieldTo }
      delete query[field[i] + "To"]
    }
  }


}



// export const pushFieldOr = (fields, key, addOr) => {
//   if (addOr && key === "$or") {
//     fields.push("$or");
//   }
//   return fields.includes(key);
// }


export const deleteFieldOr = (fields) => {
  for (let i = fields.length - 1; i !== 0; i--) {
    if (fields[i] === "$or") {
      fields.pop()
    } else break
  }
}
