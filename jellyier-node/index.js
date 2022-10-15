const express = require('express')
const axios = require('axios')
const app = express()
const port = 3339

app.use(express.static('../public'))

app.get("/genres", (req, res) => {
  axios.get("https://api.themoviedb.org/3/genre/movie/list?api_key=144a355c3d02e2f0df2d5f68ad9d78dd").then(response=>{
    res.json(response.data)
  })
})

app.get("/discover/movie", (req, res) => {
  axios.get("https://api.themoviedb.org/3/discover/movie?api_key=144a355c3d02e2f0df2d5f68ad9d78dd&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1&vote_average.gte=6&with_genres="+req.query.genres).then(response=>{
    res.json(response.data)
  })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
