// import { readFileConfig } from "../utils"
import {
  ApartamentTypeModel,
  HouseTypeModel,
  GarageTypeModel,
  PlotTypeModel,
} from "../models/index.js"

export const fetchDataCategory = async (req, res) => {
  const category = req.body.category

  if ( category === "apartment" ) {
    try {
      const {
        typeTransaction,
        typeObject,
        category,
        location,
        photos,
        plans,
        heading,
        description,
        price,
        phone,
        messengers,
        //
        typeStructure,
        generalArea,
        livingArea,
        floor,
        floorHouse,
        number,
        numberRooms,
        balconies,
        bathroom,
        renovation,
        parking,
        elevators,
        entrance,
      } = req.body
  
      const doc = new ApartamentTypeModel({
        typeTransaction,
        typeObject,
        category,
        location,
        photos,
        plans,
        heading,
        description,
        price,
        phone,
        messengers,
        //
        typeStructure,
        generalArea,
        livingArea,
        floor,
        floorHouse,
        number,
        numberRooms,
        balconies,
        bathroom,
        renovation,
        parking,
        elevators,
        entrance,
      })
  
      const apartamentDoc = await doc.save()
  
      res.status(200).json({ success: true, data: apartamentDoc })
    } catch (err) {
      console.log(err)
      res.status(500).json({
        message: "Один из пунктов указан некорректно",
      })
    }
  } else if ( category === "house" ) {
    try {
      const {
        typeTransaction,
        typeObject,
        category,
        location,
        photos,
        plans,
        heading,
        description,
        price,
        phone,
        messengers,
        //
        typeStructure,
        generalArea,
        livingArea,
        numberFloor,
        numberRooms,
        sewerage,
        bathroom,
        waterSupply,
        gas,
        heating,
        electricity,
        additionally,
      } = req.body
  
      const doc = new HouseTypeModel({
        typeTransaction,
        typeObject,
        category,
        location,
        photos,
        plans,
        heading,
        description,
        price,
        phone,
        messengers,
        //
        typeStructure,
        generalArea,
        livingArea,
        numberFloor,
        numberRooms,
        sewerage,
        bathroom,
        waterSupply,
        gas,
        heating,
        electricity,
        additionally,
      })
  
      const houseDoc = await doc.save()
  
      res.status(200).json({ success: true, data: houseDoc })
    } catch (err) {
      console.log(err)
      res.status(500).json({
        message: "Один из пунктов указан некорректно",
      })
    }
  } else if ( category === "garage" ) {
    try {
      const {
        typeTransaction,
        typeObject,
        category,
        location,
        photos,
        plans,
        heading,
        description,
        price,
        phone,
        messengers,
        //
        generalArea,
        waterSupply,
        electricity,
      } = req.body
  
      const doc = new GarageTypeModel({
        typeTransaction,
        typeObject,
        category,
        location,
        photos,
        plans,
        heading,
        description,
        price,
        phone,
        messengers,
        //
        generalArea,
        waterSupply,
        electricity,
      })
  
      const garageDoc = await doc.save()
  
      res.status(200).json({ success: true, data: garageDoc })
    } catch (err) {
      console.log(err)
      res.status(500).json({
        message: "Один из пунктов указан некорректно",
      })
    }
  } else if ( category === "plot" ) {
    try {
      const {
        typeTransaction,
        typeObject,
        category,
        location,
        photos,
        plans,
        heading,
        description,
        price,
        phone,
        messengers,
        //
        generalArea,
        waterSupply,
        electricity,
        gas,
        sewerage,
      } = req.body
  
      const doc = new PlotTypeModel({
        typeTransaction,
        typeObject,
        category,
        location,
        photos,
        plans,
        heading,
        description,
        price,
        phone,
        messengers,
        //
        generalArea,
        waterSupply,
        electricity,
        gas,
        sewerage,
      })
  
      const plotDoc = await doc.save()
  
      res.status(200).json({ success: true, data: plotDoc })
    } catch (err) {
      console.log(err)
      res.status(500).json({
        message: "Один из пунктов указан некорректно",
      })
    }
  }
}

 
