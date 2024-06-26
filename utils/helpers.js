export const getRandomInt = () => {
  let number = ""
  for (let i = 0; i < 5; i++) {
    let elem = Math.floor(Math.random() * 10)
    number += elem
  }
  return number
}

// export const rangeField = (query, [field]) => {
//   if (!(query[field + "From"] || query[field + "To"])) return

//   const fieldFrom = query[field + "From"]
//   const fieldTo = query[field + "To"]

//   if (fieldFrom && fieldTo) {
//     query[field] = { $gte: +fieldFrom, $lte: +fieldTo }
//     delete query[field + "From"]
//     delete query[field + "To"]
//   } else if (fieldFrom) {
//     query[field] = { $gte: +fieldFrom }
//     delete query[field + "From"]
//   } else if (fieldTo) {
//     query[field] = { $lte: +fieldTo }
//     delete query[field + "To"]
//   }
// }

export const rangeField = (query, field) => {
  let validation = [true]

  //? Для гибкого использования используем массив значений
  for (let i = 0; i < field.length; i++) {
    if (!(query[field[i] + "From"] || query[field[i] + "To"])) continue

    let fieldFrom = query[field[i] + "From"]
    let fieldTo = query[field[i] + "To"]

    
    if (fieldFrom && fieldTo) {
      if (fieldFrom > fieldTo) {
        //? приравнивание в случае невалидации
        validation.splice(0, 1, false, field[i])
        fieldFrom = fieldTo
      }

      query[field[i]] = { $gte: +fieldFrom, $lte: +fieldTo }
      delete query[field[i] + "From"]
      delete query[field[i] + "To"]
    } else if (fieldFrom) {
      query[field[i]] = { $gte: +fieldFrom }
      delete query[field[i] + "From"]
    } else if (fieldTo) {
      query[field[i]] = { $lte: +fieldTo }
      delete query[field[i] + "To"]
    }
  }

  //? Возвращаем строку для проверки
  if (validation.length > 0) return validation
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
