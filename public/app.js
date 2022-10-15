var selectedMovie;

var genres = [];

fetch("requests/genres").then(async response => {
    response.json().then(data => {
        genres = data.genres

        var genreList = document.getElementById("genreList")
        genres.forEach(genre => {
            var genreDiv = document.createElement('div');
            genreDiv.textContent = genre.name
            genreList.appendChild(genreDiv)
        })

    })
})



function search(term) {
    if (term) {

        /* window.history.pushState("", "", '/newpage'); */
        urlParams.set("search", term)
        console.log(urlParams.toString())
        /* window.history.pushState("", "", 'requests?' + urlParams.toString()); */
        form.elements["search"].value = term
        fetch("https://pixelboop.net/ombi/api/v2/search/multi/" + term, {
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
    } else {

    }
}

function show(value) {
    if (value) {
        document.getElementById(`detailDim`).style.display = `block`
        document.body.style.position = 'fixed';
        document.body.style.top = `-${window.scrollY}px`;

        var showdetails = document.getElementById("showdetails")

        while (showdetails.firstChild) {
            showdetails.removeChild(showdetails.lastChild);
        }

        document.getElementById("results").style.pointerEvents="none"

        document.getElementById("genreList").style.display = "none"

        if (selectedMovie) {
            var posterImage = document.createElement('img');
            posterImage.src = "https://image.tmdb.org/t/p/w300" + selectedMovie.poster
            document.getElementById("showdetails").appendChild(posterImage)
            var posterOverview = document.createElement('span');
            posterOverview.textContent = selectedMovie.overview
            document.getElementById("showdetails").appendChild(posterOverview)
        }

    } else {
        selectedMovie = null;
        document.getElementById("results").style.pointerEvents="revert"
        document.getElementById(`detailDim`).style.display = `none`
        document.getElementById("genreList").style.display = "block"
        const scrollY = document.body.style.top;
        document.body.style.position = '';
        document.body.style.top = '';
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }
}

/* show(true) */

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

var form = document.getElementById("search")
var results = document.getElementById("results")

if (urlParams.has("search")) search(urlParams.get("search"))

var timeout
form.addEventListener("keyup", (event) => {
    if (timeout) {
        clearTimeout(timeout)
    }
    timeout = setTimeout(() => {
        search(form.elements["search"].value)
    }, 500);
})

form.addEventListener('submit', (event) => {
    console.log("SEARCH")
    console.log(form.elements["search"].value)

    search(form.elements["search"].value)

    event.preventDefault();
});