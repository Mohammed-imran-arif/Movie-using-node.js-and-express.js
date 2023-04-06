const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
const app = express();

const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

app.use(express.json());
const intializetaionOfDbandServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000");
    });
  } catch (error) {
    console.log(`Data base error is ${error}`);
    process.exit(1);
  }
};

intializetaionOfDbandServer();

//API 1 Get method to return all movie list
const ConvertMovieDb = (objectItem) => {
  return {
    movieName: objectItem.movie_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getMoviesListQuery = `select movie_name from movie;`;
  const getMovieListQueryResponse = await db.all(getMoviesListQuery);
  response.send(
    getMovieListQueryResponse.map((eachMovie) => ConvertMovieDb(eachMovie))
  );
});

//API 2 Post method create a new movie
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const createMovieQuery = `insert into movie(director_id,movie_name,lead_actor)
  values('${directorId}','${movieName}','${leadActor}');`;
  const createMovieQueryResponse = await db.run(createMovieQuery);
  response.send("Movie Successfully Added");
});

//API 3 GET method Returns a movie based on the movie ID
const ConvertMovieDbApi3 = (objectItem) => {
  return {
    movieId: objectItem.movie_id,
    directorId: objectItem.director_id,
    movieName: objectItem.movie_name,
    leadActor: objectItem.lead_actor,
  };
};
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieDetailsQuery = `select * from movie
    where movie_id =${movieId};`;
  const getMovieQueryResponse = await db.get(getMovieDetailsQuery);
  response.send(ConvertMovieDbApi3(getMovieQueryResponse));
});

//API 4 Put method Updates the details of a movie in the movie table based on the movie ID

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieQuery = `update movie set director_id=${directorId},
    movie_name='${movieName}',
    lead_actor ='${leadActor}'
    where movie_id=${movieId}`;
  const updateMovieQueryResponse = await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//API 5 Delete method Deletes a movie from the movie table based on the movie ID
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `delete from movie where movie_id=${movieId};`;
  const deleteMovieQueryResponse = await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//API 6 Returns a list of all directors in the director table
const convertDirectorApi6 = (objectItem) => {
  return {
    directorId: objectItem.director_id,
    directorName: objectItem.director_name,
  };
};
app.get("/directors/", async (request, response) => {
  const getDirectorQuery = `select * from director;`;
  const getDirectorQueryResponse = await db.all(getDirectorQuery);
  response.send(
    getDirectorQueryResponse.map((eachItem) => convertDirectorApi6(eachItem))
  );
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMovieByDirectorQuery = `select movie_name as movieName
    from movie where director_id=${directorId};`;
  const getMovieByDirectorQueryResponse = await db.all(getMovieByDirectorQuery);
  response.send(getMovieByDirectorQueryResponse);
});

module.exports = app;
