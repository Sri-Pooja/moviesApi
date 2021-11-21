const express = require("express");
const app = express();

const path = require("path");
const dbpath = path.join(__dirname, "moviesData.db");
const sqlite3 = require("sqlite3");

const { open } = require("sqlite");
app.use(express.json());
let db = null;

const intializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
  }
};

intializeDBAndServer();

convertMovieObjToDataBaseResponseObj = (movieObject) => {
  return {
    movieId: movieObject.movie_id,
    directorId: movieObject.director_id,
    movieName: movieObject.movie_name,
    leadActor: movieObject.lead_actor,
  };
};

convertDirectorObjectToResponseObj = (directorObj) => {
  return {
    directorId: directorObj.director_id,
    directorName: directorObj.director_name,
  };
};
//get all movies from movie table

app.get("/movies/", async (request, response) => {
  const getMOvieQuery = `
    SELECT movie_name 
    FROM movie
  `;
  const moviesArray = await db.all(getMOvieQuery);
  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

//get movie

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovie = `
        SELECT 
            * 
        FROM 
            movie
        WHERE 
            movie_id = ${movieId};
    `;
  const movieArray = await db.get(getMovie);
  response.send(
    movieArray.map((movieObject) =>
      convertMovieObjToDataBaseResponseObj(movieObject)
    )
  );
});

// create movie query

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  console.log(movieDetails);
  const { directorId, movieName, leadActor } = movieDetails;
  const createMOvieQuery = `
        INSERT INTO 
        movie (director_id, movie_name, lead_actor) 
        VALUES 
        (${directorId}, '${movieName}', '${leadActor}')
    `;
  await db.run(createMOvieQuery);
  response.send("Movie Successfully Added");
});

//update table

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;

  const updateTableQuery = `
        UPDATE movie 
        SET 
            director_id = ${directorId},
            movie_name = '${movieName}',
            lead_actor = '${leadActor}'

        WHERE movie_id = ${movieId}
    `;
  await db.run(updateTableQuery);
  response.send("Movie Details Updated");
});

//delete movie

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovie = `
        DELETE FROM 
            movie 
        WHERE 
            movie_id = ${movieId};
    `;
  await db.run(deleteMovie);
  response.send("Movie Removed");
});

// get directors query

app.get("/directors/", async (request, response) => {
  const getDirectors = `
        SELECT 
            *
        FROM 
            director;
    `;
  const directorsArray = await db.all(getDirectors);
  response.send(
    directorsArray.map((eachObject) =>
      convertDirectorObjectToResponseObj(eachObject)
    )
  );
});

// get movies directed by a specific director

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMovieOfSpecificDirector = `
        SELECT *
        FROM movie
        WHERE director_id = '${directorId}';
    `;
  const moviesOfDirector = await db.all(getMovieOfSpecificDirector);
  response.send(
    moviesOfDirector.map((eachObject) => ({ movieName: eachObject.movie_name }))
  );
});

module.exports = app;
