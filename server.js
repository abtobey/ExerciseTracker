const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");

const PORT = process.env.PORT || 3000;

const db = require("./models");
const { Exercise, Workout } = require("./models");

const app = express();
const path= require("path");

app.use(logger("dev"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/workout", { useNewUrlParser: true, useFindAndModify: false});

app.post("/api/workouts", (req,res) => {
  const newWorkout= new Workout(req.body);
  newWorkout.day=Date.now();
  newWorkout.totalDuration=0;
  db.Workout.create(newWorkout)
  .then((data) => {
    res.json(data);
  })
})
app.get("/api/workouts", (req,res) => {
  db.Workout.find({})
  .populate("exercises")
  .then(dbWorkout => {
    res.json(dbWorkout)
  })
  .catch(err => {
    res.json(err)
  })

})
app.get("/api/workouts/range", (req,res) => {
  db.Workout.find({})
  .limit(7)
  .populate("exercises")
  .then(dbWorkout => {
    res.json(dbWorkout)
  })
  .catch(err => {
    res.json(err)
  })

})

  app.put("/api/workouts/:id", (req, res) => {
    const exercise=new Exercise(req.body);
    exercise.day=Date.now()
    let dur=exercise.duration;
    db.Exercise.create(exercise)
    .then(({_id}) => db.Workout.findOneAndUpdate({"_id":req.params.id}, { $push: { exercises: _id}, $inc: {totalDuration: dur}}, { new: true }))
    .then(dbWorkout => {
        res.json(dbWorkout);
    })
    .catch(err => {
        res.json(err);
    })
  })

app.get("/stats", (req,res) =>{
    res.sendfile(path.join(__dirname, "/public/stats.html"))
})

app.get("/exercise", (req,res) => {
    res.sendfile(path.join(__dirname,"/public/exercise.html"));
})
app.listen(PORT, () => {
  console.log(`App running on port ${PORT}!`);
});