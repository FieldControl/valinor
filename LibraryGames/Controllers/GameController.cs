using LibraryGames.Data;
using LibraryGames.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace LibraryGames.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GameController
    {
        private readonly EFContext _context;

        public GameController(EFContext context)
        {
            _context = context;
        }

        // GET: api/Games/5
        [HttpGet("{id}")]
        public JsonResult GetId(long id)
        {
            try
            {
                var game = _context.Games.Where(a => a.Id == id).Single();
                return new JsonResult(new { Result = game });
            }
            catch
            {
                return new JsonResult(new { Result = "Not Found Game" });
            }
        }

        [HttpGet]
        public JsonResult Getlist()
        {
            var games = _context.Games.Where<Game>(x => x.Id != 0);
            return new JsonResult(new { Result = games });
        }

        [HttpPost]
        public JsonResult Post(Game game)
        {
            try
            {
                _context.Games.Add(game);
                _context.SaveChanges();
                return new JsonResult(new { result = "Created" });
            }
            catch
            {
                return new JsonResult(new { result = "Failed to create" });
            }
        }

        // PUT: api/Games/5
        [HttpPut("{id}")]
        public JsonResult Update(int id, Game game)
        {
            try
            {
                var gameOld = _context.Games.Where(x => x.Id == id).Single();

                gameOld.Name = game.Name;
                gameOld.Release = game.Release;
                gameOld.Category = game.Category;
                gameOld.Score = game.Score;

                _context.Games.Update(gameOld);
                _context.SaveChanges();

                return new JsonResult(new { result = "Updated" });
            }
            catch
            {
                return new JsonResult(new { result = "Bad Request" });
            }
        }

        // DELETE: api/ApiWithActions/5
        [HttpDelete("{id}")]
        public JsonResult Delete(int id)
        {
            var game = _context.Games.FindAsync(id);
            if (game.Result == null)
            {
                return new JsonResult(new { result = "Not Found" });
            }

            _context.Games.Remove(game.Result);
            _context.SaveChanges();
            return new JsonResult(new { result = "Deleted" });
        }
    }
}
