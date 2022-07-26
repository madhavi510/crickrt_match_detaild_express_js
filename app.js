const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "cricketMatchDetails.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const conversionToObject = (object) => {
  return {
    playerId: object.player_id,
    playerName: object.player_name,
  };
};

app.get("/players/", async (request, response) => {
  const getPlayersDetailsQuery = `
       select *
        from 
        player_details;`;
  const getPlayerDetailsResponse = await database.all(getPlayersDetailsQuery);
  response.send(
    getPlayerDetailsResponse.map((player) => conversionToObject(player))
  );
});

// ApI 2

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getSpecificPlayerQuery = `
      select *
      from 
      player_details
      where player_id = ${playerId};`;
  const getSpecificPlayerResponse = await database.get(getSpecificPlayerQuery);
  response.send(conversionToObject(getSpecificPlayerResponse));
});

// API 3

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const updatePlayerQuery = `
         update player_details
         set 
            player_name = '${playerName}'
            where player_id = ${playerId};`;

  await database.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//ApI 4

const conversionToObject1 = (object) => {
  return {
    matchId: object.match_id,
    match: object.match,
    year: object.year,
  };
};

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchDetailsQuery = `
    select * 
    from 
    match_details
    where match_id = ${matchId};`;

  const getMatchDetailsResponse = await database.get(getMatchDetailsQuery);
  response.send(conversionToObject1(getMatchDetailsResponse));
});

// API 5

app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getListPlayersQuery = `
      select *
      from player_match_score
      natural join
      match_details
      where player_id = ${playerId};`;

  const listOfMatchesResponse = await database.all(getListPlayersQuery);
  response.send(
    listOfMatchesResponse.map((match) => conversionToObject1(match))
  );
});

// ApI 6

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getMatchListQuery = `
    select 
     *
     from player_match_score 
     natural join player_details
     where match_id = ${matchId};`;

  const getSpecificMatchResponse = await database.all(getMatchListQuery);
  response.send(
    getSpecificMatchResponse.map((eachMatch) => conversionToObject(eachMatch))
  );
});

app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getMatchPlayerQuery = `
         select 
           player_id as playerId,
            player_name as playerName,
            sum(score) as totalScore,
            sum(fours) as totalFours,
            sum(sixes) as totalSixes
        from player_match_score
            natural join player_details
        where 
          player_id = ${playerId};`;
  const getMatchPlayerResponse = await database.get(getMatchPlayerQuery);
  response.send(getMatchPlayerResponse);
});

module.exports = app;
