var selectedMovie;

var genres = [];
var selectedGenres = [];

var genreTimeout;
var genreList = document.getElementById("genreList")
var searchBar = document.getElementById("searchBar")

var bottom;

var page = 1
var searching = false


if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}


function sortGenresAlphabetically() {
    var children = Array.from(genreList.children)
    children.sort(function (x, y) { return x.textContent.localeCompare(y.textContent) });
    children.forEach(child => {
        genreList.appendChild(child)
    })
}
function sortGenresSelected() {
    var children = Array.from(genreList.children)
    children.sort(function (x, y) { return y.classList.contains("selectedGenre") - x.classList.contains("selectedGenre") });
    children.forEach(child => {
        genreList.appendChild(child)
    })
}
function unselectGenres() {
    Array.from(genreList.children).forEach(child => {
        child.classList.remove("selectedGenre")
    })
    sortGenresAlphabetically()
}

fetch("requests/genres").then(async response => {
    response.json().then(data => {
        genres = data.genres


        genres.forEach((genre, index) => {
            var genreDiv = document.createElement('div');
            genreDiv.textContent = genre.name
            /* if (index < 6) genreDiv.classList.add("selectedGenre") */
            genreDiv.onclick = function () {

                if (selectedGenres.find(g => g == genre)) {
                    var index = selectedGenres.findIndex(g => g == genre)
                    console.log(index)
                    console.log("REMOVE: " + genre.name)
                    if (index > -1) { // only splice array when item is found
                        selectedGenres.splice(index, 1); // 2nd parameter means remove one item only
                    }
                } else {
                    console.log("ADD: " + genre.name)
                    selectedGenres.push(genre)
                }
                console.log(selectedGenres)

                searchBar.value = ""



                if (genreDiv.classList.contains("selectedGenre")) {
                    genreDiv.classList.remove("selectedGenre")
                } else {
                    genreDiv.classList.add("selectedGenre")
                }
                page = 1
                sortGenresAlphabetically()
                sortGenresSelected()

                if (selectedGenres.length > 0) {

                    if (genreTimeout) {
                        clearTimeout(genreTimeout)
                    }
                    genreTimeout = setTimeout(() => {
                        console.log("search")
                        console.log(selectedGenres.map(g => g.id).join(","))
                        showGenre(true, 1, selectedGenres.map(g => g.id).join(","))

                        urlParams.delete("search")

                        console.log("SELECTED_________________________")

                        console.log(selectedGenres)

                        urlParams.set("genres", selectedGenres.map(g => g.id).join(","))
                        console.log(urlParams.toString())
                        document.title = "Genres: " + selectedGenres.map(g => g.id).join(",")
                        window.history.pushState({}, '', 'requests?' + urlParams.toString());
                        console.log("PUSH HISTORY")

                    }, 1000);
                } else {
                    console.log("DELETE GENRES")
                    urlParams.delete("genres")
                    window.history.pushState({}, '', 'requests?' + urlParams.toString());
                    console.log("PUSH HISTORY2")
                }
            }
            genreList.appendChild(genreDiv)
        })

        if (urlParams.has("genres")) {
            urlParams.get("genres").split(",").forEach(savedgenre => {
                console.log(savedgenre)
                if (genres.includes(savedgenre)) {
                    selectedGenres.push(savedgenre)
                }
                genres.forEach((genre, index) => {
                    console.log(genre.name)
                    if (genre.id == savedgenre) {
                        Array.from(genreList.children)[index].classList.add("selectedGenre")
                        selectedGenres.push(genre)
                    }
                })

            })
            sortGenresSelected()
            console.log(selectedGenres.map(g => g.id).join(","))
            showGenre(true, 1, selectedGenres.map(g => g.id).join(","))
        }

    })
})
function showGenre(overwrite = true, targetpage, targetgenres) {

    console.log(page)

    if (overwrite) {
        searchBar.value = ""
        urlParams.delete("search")
        //window.history.pushState({}, '', 'requests?' + urlParams.toString());
        //console.log("PUSH HISTORY3")
    }

    fetch("requests/discover/all?genres=" + targetgenres + "&page=" + (targetpage || 1)).then(async response => {
        response.json().then(data => {
            console.log(data)

            searching = false

            if (overwrite) {
                while (results.firstChild) {
                    results.removeChild(results.lastChild);
                }
                page = 1
            }

            data.results.forEach(element => {
                element.poster = element.poster_path
                var div = document.createElement('div');
                var titleText = document.createElement('span');
                titleText.textContent = element.title
                var posterImage = document.createElement('img');
                posterImage.src = "https://image.tmdb.org/t/p/w300" + element.poster
                div.appendChild(titleText)
                div.appendChild(posterImage)
                div.onclick = function () {
                    selectedMovie = element
                    show(true)
                }
                results.appendChild(div)
            })

        })
    })


    document.onscroll = function (ev) {
        var oldBottom = bottom
        if ((window.innerHeight + window.scrollY) >= document.body.scrollHeight * 0.9) {
            bottom = true
            if (!searching) {
                searching = true
            }
        } else {
            bottom = false
        }
        if (bottom != oldBottom) {
            console.log(bottom)
            if (bottom) {
                page++
                showGenre(false, page, targetgenres)
            }
            console.log(page)
        }
    };

}
function showTrending(overwrite = true, targetpage) {
    if (overwrite) {
    searchBar.value = ""
    unselectGenres()
    urlParams.delete("genres")
    urlParams.delete("search")
    window.history.pushState({}, '', 'requests'+ (urlParams.toString() ? '?' : '') + urlParams.toString());
    console.log("PUSH HISTORY4")
    }

    fetch("requests/trending/all" + "?page=" + (targetpage || 1)).then(async response => {
        response.json().then(data => {
            console.log(data)

            searching = false

            if (overwrite) {
                while (results.firstChild) {
                    results.removeChild(results.lastChild);
                }
                page = 1
            }
            data.results.forEach(element => {
                element.poster = element.poster_path
                var div = document.createElement('div');
                var titleText = document.createElement('span');
                titleText.textContent = element.title
                var posterImage = document.createElement('img');
                posterImage.src = "https://image.tmdb.org/t/p/w300" + element.poster
                div.appendChild(titleText)
                div.appendChild(posterImage)
                div.onclick = function () {
                    selectedMovie = element
                    show(true)
                }
                results.appendChild(div)
            })

        })
    })
    document.onscroll = function (ev) {
        var oldBottom = bottom
        if ((window.innerHeight + window.scrollY) >= document.body.scrollHeight * 0.9) {
            bottom = true
            if (!searching) {
                searching = true
                
            }
        } else {
            bottom = false
        }
        if (bottom != oldBottom) {
            console.log(bottom)
            if (bottom) {
                page++
                showTrending(false, page)
            }
            console.log(page)
        }
    };
}
function showPopular(overwrite = true, targetpage, history=true) {
    if (overwrite) {
    searchBar.value = ""
    unselectGenres()
    urlParams.delete("search")
    urlParams.delete("genres")
    if (history) {window.history.pushState({}, '', 'requests'+ (urlParams.toString() ? '?' : '') + urlParams.toString());
    console.log("PUSH HISTORY5")}
    }

    fetch("requests/popular/all" + "?page=" + (targetpage || 1)).then(async response => {
        response.json().then(data => {
            console.log(data)

            searching = false

            if (overwrite) {
                while (results.firstChild) {
                    results.removeChild(results.lastChild);
                }
                page = 1
            }
            data.results.forEach(element => {
                /* console.log(element) */
                element.poster = element.poster_path
                /* console.log("https://image.tmdb.org/t/p/w300" + element.poster) */
                var div = document.createElement('div');
                var titleText = document.createElement('span');
                titleText.textContent = element.title
                var posterImage = document.createElement('img');
                posterImage.src = "https://image.tmdb.org/t/p/w300" + element.poster
                div.appendChild(titleText)
                div.appendChild(posterImage)
                div.onclick = function () {
                    selectedMovie = element
                    show(true)
                }
                results.appendChild(div)
            })

        })
    })
    document.onscroll = function (ev) {
        var oldBottom = bottom
        if ((window.innerHeight + window.scrollY) >= document.body.scrollHeight * 0.9) {
            bottom = true
            if (!searching) {
                searching = true
                
            }
        } else {
            bottom = false
        }
        if (bottom != oldBottom) {
            console.log(bottom)
            if (bottom) {
                page++
                showPopular(false, page)
            }
            console.log(page)
        }
    };
}



function search(verwrite = true, targetpage, term, history=true) {
    if (!term) return;

    unselectGenres()

    urlParams.delete("genres")

    urlParams.set("search", term)
    console.log(urlParams.toString())
    document.title = "Search: " + term
    if (history) window.history.pushState({}, '', 'requests' + (urlParams.toString() ? '?' : '') + urlParams.toString());
    console.log("PUSH HISTORY6")
    form.elements["search"].value = term
    fetch("https://pixelboop.net/ombi/api/v2/search/multi/" + term + "?page=" + (targetpage|| 1), {
        method: "POST",
        headers: {
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJQaXhlbEJsb2IiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjM2ZTFjZjUxLWRiMDItNDA3OC05ZmQzLWY0NWNhN2Y3MGYzYiIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL25hbWUiOiJQaXhlbEJsb2IiLCJqdGkiOiJkZTMzYTdiOC1hYWUwLTQ5ZjItYTMzZC03NDdiN2FiZTYwMDgiLCJJZCI6IjM2ZTFjZjUxLWRiMDItNDA3OC05ZmQzLWY0NWNhN2Y3MGYzYiIsInJvbGUiOiJBZG1pbiIsImV4cCI6MTY5NTg4MTg4MywiaXNzIjoiT21iaSIsImF1ZCI6Ik9tYmkifQ.8B98l8V9hlnsV9MdEW2WrnbkOPAPeQOF5ZL7imhMGlI',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ "movies": true, "music": false, "people": false, "tvShows": true })
    }).then(async response => {
        response.json().then(data => {
            while (results.firstChild) {
                results.removeChild(results.lastChild);
            }
            console.log(data)
            data.forEach(element => {
                console.log("https://image.tmdb.org/t/p/w300" + element.poster)
                var div = document.createElement('div');
                var titleText = document.createElement('span');

                titleText.textContent = element.title
                var posterImage = document.createElement('img');
                posterImage.src = "https://image.tmdb.org/t/p/w300" + element.poster
                div.appendChild(titleText)
                div.appendChild(posterImage)
                div.onclick = function () {
                    selectedMovie = element
                    show(true)
                }
                results.appendChild(div)
            });
        })
    })

    document.onscroll = function (ev) {
        var oldBottom = bottom
        if ((window.innerHeight + window.scrollY) >= document.body.scrollHeight * 0.9) {
            bottom = true
            if (!searching) {
                searching = true
                
            }
        } else {
            bottom = false
        }
        if (bottom != oldBottom) {
            console.log(bottom)
            if (bottom) {
                page++
                search(false, page, term)
            }
            console.log(page)
        }
    };
}

function historyListener(event) {
    console.log("History pop");  
    if (document.getElementById(`detailDim`).style.display == "block") {
        console.log("CLOSE")
        show(false)
        history.go(1);
    } else {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        //if (urlParams.has("search")) search(false, 1, urlParams.get("search"), false)
        if (urlParams.has("search")) {
            search(false, 1, urlParams.get("search"), false)
        } else if (urlParams.has("genres")) {
            selectedGenres = []
            urlParams.get("genres").split(",").forEach(savedgenre => {
                console.log(savedgenre)
                if (genres.includes(savedgenre)) {
                    selectedGenres.push(savedgenre)
                }
                genres.forEach((genre, index) => {
                    console.log(genre.name)
                    if (genre.id == savedgenre) {
                        Array.from(genreList.children)[index].classList.add("selectedGenre")
                        selectedGenres.push(genre)
                    }
                })

            })
            sortGenresSelected()
            console.log(selectedGenres.map(g => g.id).join(","))
            showGenre(true, 1, selectedGenres.map(g => g.id).join(","))
        } else {
            console.log("No Search/Genre")
            showPopular(true, 1, false)
        }
    } 
}

window.addEventListener('popstate', historyListener, false);


function show(value) {

    document.getElementById('footer').style.opacity = 0;

    if (value) {

        window.history.pushState('forward', null, '');

        document.body.style.overflow = "hidden"; // ADD THIS LINE
    document.body.style.height = "100%"; // ADD THIS LINE

        document.getElementById(`detailDim`).style.display = `block`

        var showdetails = document.getElementById("showdetails")

        while (showdetails.firstChild) {
            showdetails.removeChild(showdetails.lastChild);
        }



        document.getElementById("results").style.pointerEvents = "none"

        document.getElementById("genreList").style.display = "none"

        if (selectedMovie) {

            var ratings = document.getElementById("rating")
            var stars = selectedMovie.vote_average / 10 * 5

            while (ratings.firstChild) {
                ratings.removeChild(ratings.lastChild);
            }

            for (let index = 0; index < Math.floor(stars); index++) {
                var star = document.createElement("i")
                star.classList.add("fa")
                star.classList.add("fa-star")
                star.ariaHidden = "true"
                document.getElementById("rating").appendChild(star)
            }

            if (stars % 1) {
                var star = document.createElement("i")
                star.classList.add("fa")
                star.classList.add("fa-star-half")
                star.ariaHidden = "true"
                document.getElementById("rating").appendChild(star)
            }



            var posterImage = document.getElementById("posterImage")
            posterImage.src = "https://image.tmdb.org/t/p/w300" + selectedMovie.poster
            var posterOverviewDiv = document.createElement('div');
            var posterOverview = document.createElement('span');
            console.log(selectedMovie)
            document.getElementById("title").textContent = selectedMovie.title || selectedMovie.name
            posterOverview.textContent = selectedMovie.overview
            posterOverviewDiv.appendChild(posterOverview)
            posterOverviewDiv.classList.add("overview")
            document.getElementById("showdetails").appendChild(posterOverviewDiv)

            document.getElementById("watch").style.display = "none"
            document.getElementById("request").style.display = "block"

            fetch("requests/search/" + (selectedMovie.movie == true ? "Movie" : "Series") + "/" + selectedMovie.id).then(async response => {
                response.json().then(data => {
                    console.log(data)
                    if (data.jellyfinUrl) {
                        document.getElementById("watch").style.display = "block"
                        document.getElementById("request").style.display = "none"
                        document.getElementById("watch").onclick = function () {
                            window.location = data.jellyfinUrl
                        }
                    } else {
                        document.getElementById("request").style.display = "block"
                        document.getElementById("watch").style.display = "none"
                    }
                })
            })

        }

    } else {

        document.body.style.overflow = "auto"; // ADD THIS LINE
    document.body.style.height = "auto"; // ADD THIS LINE

        selectedMovie = null;
        document.getElementById("results").style.pointerEvents = "revert"
        document.getElementById(`detailDim`).style.display = `none`
        document.getElementById("genreList").style.display = "block"
    }
}

/* show(true) */


const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

historyListener()

var form = document.getElementById("search")
var results = document.getElementById("results")

if (urlParams.has("search")) search(false, 1, urlParams.get("search"))

var timeout
form.addEventListener("keyup", (event) => {
    if (timeout) {
        clearTimeout(timeout)
    }
    timeout = setTimeout(() => {
        search(false, 1, form.elements["search"].value)
    }, 500);
})

form.addEventListener('submit', (event) => {
    console.log("SEARCH")
    console.log(form.elements["search"].value)

    search(false, 1, form.elements["search"].value)

    form.elements["search"].blur()

    event.preventDefault();
});