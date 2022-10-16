const express = require('express')
const axios = require('axios')
const app = express()
const port = 3339

app.use(express.static('../public'))

app.get("/search/Movie/*", async (req, res) => {
  var id = req.url.split("/")[req.url.split("/").length - 1]
  axios.get("https://pixelboop.net/ombi/api/v2/search/Movie/" + id, {
    headers: {
      'ApiKey': "c1c3c4b1c68b4671b5b327b09aa17dcf"
    }
  }).then(response => {
    console.log(response.data)
    res.json(response.data)
  })
})

app.get("/search/Series/*", async (req, res) => {
  var id = req.url.split("/")[req.url.split("/").length - 1]
  axios.get("https://pixelboop.net/ombi/api/v2/search/tv/" + id, {
    headers: {
      'ApiKey': "c1c3c4b1c68b4671b5b327b09aa17dcf"
    }
  }).then(response => {
    console.log(response.data)
    res.json(response.data)
  })
})

app.get("/genres", async (req, res) => {
  var tvreq = await axios.get("https://api.themoviedb.org/3/genre/tv/list?api_key=144a355c3d02e2f0df2d5f68ad9d78dd")
  var moviereq = await axios.get("https://api.themoviedb.org/3/genre/movie/list?api_key=144a355c3d02e2f0df2d5f68ad9d78dd")

  tvreq.data.genres.forEach(genre => {
    genre.tv = true
  })

  moviereq.data.genres.forEach(genre => {
    genre.movie = true
  })

  var genres = tvreq.data.genres.concat(moviereq.data.genres)
  genres = [...new Map(genres.map((m) => [m.id, m])).values()];
  genres.sort((a, b) => a.name.localeCompare(b.name))

  genres.forEach((genre, index) => {
    genres.forEach((g, i) => {
      if (index != i && genre.id == g.id) {
        console.log(g.name)
      }
    });
  });

  res.json({ genres: genres })

})

app.get("/tv/genres", (req, res) => {
  axios.get("https://api.themoviedb.org/3/genre/tv/list?api_key=144a355c3d02e2f0df2d5f68ad9d78dd").then(response => {
    res.json(response.data)
  })
})

app.get("/movie/genres", (req, res) => {
  axios.get("https://api.themoviedb.org/3/genre/movie/list?api_key=144a355c3d02e2f0df2d5f68ad9d78dd").then(response => {
    res.json(response.data)
  })
})

app.get("/popular/all", async (req, res) => {
  var tvreq = await axios.get("https://api.themoviedb.org/3/tv/popular?api_key=144a355c3d02e2f0df2d5f68ad9d78dd&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=" + (req.query.page || 1))
  tvreq.data.results.forEach(result => {
    result.tv = true
  })

  var moviereq = await axios.get("https://api.themoviedb.org/3/movie/popular?api_key=144a355c3d02e2f0df2d5f68ad9d78dd&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=" + (req.query.page || 1))
  moviereq.data.results.forEach(result => {
    result.movie = true
  })

  var items = tvreq.data.results.concat(moviereq.data.results)

  items.sort((a, b) => b.popularity - a.popularity)

  res.json({ page: req.query.page || 1, results: items, total_pages: Math.ceil(items.length / 20), total_results: 40 })
})

app.get("/trending/all", async (req, res) => {
  var tvreq = await axios.get("https://api.themoviedb.org/3/trending/tv/week?api_key=144a355c3d02e2f0df2d5f68ad9d78dd&page=" + (req.query.page || 1))
  tvreq.data.results.forEach(result => {
    result.tv = true
  })

  var moviereq = await axios.get("https://api.themoviedb.org/3/trending/movie/week?api_key=144a355c3d02e2f0df2d5f68ad9d78dd&page=" + (req.query.page || 1))
  moviereq.data.results.forEach(result => {
    result.movie = true
  })

  var items = tvreq.data.results.concat(moviereq.data.results)

  items.sort((a, b) => b.popularity - a.popularity)

  res.json({ page: req.query.page || 1, results: items, total_pages: Math.ceil(items.length / 20), total_results: 40 })
})

app.get("/discover/all", async (req, res) => {
  var tvgenrereq = await axios.get("https://api.themoviedb.org/3/genre/tv/list?api_key=144a355c3d02e2f0df2d5f68ad9d78dd")
  var genres = []
  var preGenres = req.query.genres.split(",")
  tvgenrereq.data.genres.forEach(genre => {
    if (preGenres.includes(genre.id.toString())) genres.push(genre.id)
  });

  var tvreq = await axios.get("https://api.themoviedb.org/3/discover/tv?api_key=144a355c3d02e2f0df2d5f68ad9d78dd&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&vote_average.gte=6&with_genres=" + genres.join(",") + "&page=" + (req.query.page || 1))

  tvreq.data.results.forEach(result => {
    result.tv = true
  })

  if (genres.length == 0) tvreq.data.results = []

  var moviegenrereq = await axios.get("https://api.themoviedb.org/3/genre/movie/list?api_key=144a355c3d02e2f0df2d5f68ad9d78dd")
  var genres = []
  moviegenrereq.data.genres.forEach(genre => {
    if (preGenres.includes(genre.id.toString())) genres.push(genre.id)
  });
  var moviereq = await axios.get("https://api.themoviedb.org/3/discover/movie?api_key=144a355c3d02e2f0df2d5f68ad9d78dd&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&vote_average.gte=6&with_genres=" + genres.join(",") + "&page=" + (req.query.page || 1))

  moviereq.data.results.forEach(result => {
    result.movie = true
  })

  if (genres.length == 0) moviereq.data.results = []

  var items = tvreq.data.results.concat(moviereq.data.results)

  items.sort((a, b) => b.popularity - a.popularity)

  res.json({ page: req.query.page || 1, results: items, total_pages: Math.ceil(items.length / 20), total_results: 40 })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})