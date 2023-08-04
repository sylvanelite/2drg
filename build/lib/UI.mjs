import { xyToIdx } from "./types.mjs";
import { TERRAIN_HEIGHT, Terrain } from "./Terrain.mjs";
import { Game } from "./Game.mjs";
import { sprites, LETTER_H, LETTER_W, font } from "./sprites.mjs";
import { ImageCache } from "./ImageCache.mjs";
import { ResourceConfig } from "./Config/ResourceConfig.mjs";
import { PlayerConfig } from "./Config/PlayerConfig.mjs";
class UI {
    static draw(ctx) {
        UI.#drawMinimap(ctx);
        UI.#drawOverview(ctx);
        for (const [id, p] of Game.gameInstance.playerLiveCount) {
            const rm = Game.gameInstance.rooms[p.roomIdx];
            const ent = rm.entities[p.roomId];
            UI.#drawPlayers(ctx, ent);
        }
        UI.#drawWinCon(ctx);
        if (Game.inputs) {
            const controls = Game.inputs.get(Game.gameInstance.playerUid);
            if (controls.mousePosition) {
                ctx.lineWidth = 1;
                ctx.strokeStyle = '#FFFFFF';
                ctx.beginPath();
                ctx.arc(Math.floor(controls.mousePosition.x) - 0.5, Math.floor(controls.mousePosition.y) - 0.5, 10, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
    }
    static #drawMinimap(ctx) {
        const saleFactor = 6;
        const localPlayer = Game.gameInstance.playerLiveCount.get(Game.gameInstance.playerUid);
        const localRoom = Game.gameInstance.rooms[localPlayer.roomIdx];
        const terrainWidth = localRoom.terrain.width;
        const terrainHeight = localRoom.terrain.height;
        const playerEntity = localRoom.entities[localPlayer.roomId];
        const playerX = Math.floor(playerEntity.position.x / saleFactor) * saleFactor + localRoom.x * terrainWidth;
        const playerY = Math.floor(playerEntity.position.y / saleFactor) * saleFactor + localRoom.y * terrainHeight;
        const left = terrainWidth;
        ctx.fillStyle = "#AAAAAA";
        for (let x = -32; x <= 32; x += 1) {
            for (let y = -64; y <= 64; y += 1) {
                const worldX = playerX + x * saleFactor;
                const worldY = playerY + y * saleFactor;
                if (worldX >= 0 && worldX < terrainWidth * Game.gameInstance.worldSize &&
                    worldY >= 0 && worldY < terrainHeight * Game.gameInstance.worldSize) {
                    const roomX = Math.floor(worldX / terrainWidth);
                    const roomY = Math.floor(worldY / terrainHeight);
                    const roomIdx = xyToIdx(roomX, roomY, Game.gameInstance.worldSize);
                    const worldRoom = Game.gameInstance.rooms[roomIdx];
                    let pointX = worldX - worldRoom.x * terrainWidth;
                    let pointY = worldY - worldRoom.y * terrainHeight;
                    if (pointX <= 1) {
                        pointX = 1;
                    }
                    if (pointY <= 1) {
                        pointY = 1;
                    }
                    const filled = Terrain.getBit(pointX, pointY, worldRoom.terrain);
                    if (filled) {
                        ctx.fillRect(left + (x + 32) * 1, 0 + (y + 64) * 1, 1, 1);
                    }
                }
            }
        }
        for (const [uid, p] of Game.gameInstance.playerLiveCount) {
            const pRoom = Game.gameInstance.rooms[p.roomIdx];
            const pEnt = pRoom.entities[p.roomId];
            const px = Math.floor(pEnt.position.x / saleFactor) * saleFactor + pRoom.x * terrainWidth;
            const py = Math.floor(pEnt.position.y / saleFactor) * saleFactor + pRoom.y * terrainHeight;
            let hDist = Math.floor((playerX - px) / saleFactor);
            let vDist = Math.floor((playerY - py) / saleFactor);
            if (hDist < -32) {
                hDist = -30;
            }
            if (hDist > 32) {
                hDist = 30;
            }
            if (vDist < -64) {
                vDist = -62;
            }
            if (vDist > 64) {
                vDist = 62;
            }
            const chCl = Game.gameInstance.playerConfig.get(uid)?.chosenClass;
            if (chCl == PlayerConfig.CLASSES.DRILLER) {
                ctx.fillStyle = "#FFFF00";
            }
            if (chCl == PlayerConfig.CLASSES.SCOUT) {
                ctx.fillStyle = "#0000FF";
            }
            if (chCl == PlayerConfig.CLASSES.ENGINEER) {
                ctx.fillStyle = "#FF0000";
            }
            if (chCl == PlayerConfig.CLASSES.GUNNER) {
                ctx.fillStyle = "#00FF00";
            }
            ctx.fillRect(left + 32 - hDist, 64 - vDist, 2, 2);
        }
    }
    static #drawOverview(ctx) {
        const localPlayer = Game.gameInstance.playerLiveCount.get(Game.gameInstance.playerUid);
        const localRoom = Game.gameInstance.rooms[localPlayer.roomIdx];
        const terrainWidth = localRoom.terrain.width;
        const objectiveX = terrainWidth;
        let objectiveY = 128;
        UI.drawText(ctx, "-MISSION-", objectiveX, objectiveY);
        objectiveY += LETTER_H;
        if (Game.gameInstance.missionConfig.chosenPrimary == ResourceConfig.PRIMARY_OBJECTIVE.EGG_HUNT) {
            const objectiveStatus = Game.gameInstance.resourceLiveCount.egg + "/" + Game.gameInstance.missionConfig.goalPrimary;
            UI.drawText(ctx, "Egg Hunt:", objectiveX, objectiveY);
            objectiveY += LETTER_H;
            UI.drawText(ctx, "    " + objectiveStatus, objectiveX, objectiveY);
        }
        if (Game.gameInstance.missionConfig.chosenPrimary == ResourceConfig.PRIMARY_OBJECTIVE.MINING_EXPEDITION) {
            const objectiveStatus = Game.gameInstance.resourceLiveCount.bismore + "/" + Game.gameInstance.missionConfig.goalPrimary;
            UI.drawText(ctx, "Mining:", objectiveX, objectiveY);
            objectiveY += LETTER_H;
            UI.drawText(ctx, "    " + objectiveStatus, objectiveX, objectiveY);
        }
        if (Game.gameInstance.missionConfig.chosenPrimary == ResourceConfig.PRIMARY_OBJECTIVE.POINT_EXTRACTION) {
            const objectiveStatus = Game.gameInstance.resourceLiveCount.aquarq + "/" + Game.gameInstance.missionConfig.goalPrimary;
            UI.drawText(ctx, "Extract:", objectiveX, objectiveY);
            objectiveY += LETTER_H;
            UI.drawText(ctx, "    " + objectiveStatus, objectiveX, objectiveY);
        }
        objectiveY += LETTER_H;
        if (Game.gameInstance.missionConfig.chosenSecondary == ResourceConfig.SECONDARY_OBJECTIVE.FOSSIL) {
            const objectiveStatus = Game.gameInstance.resourceLiveCount.fossil + "/" + Game.gameInstance.missionConfig.goalSecondary;
            UI.drawText(ctx, "Fossil:", objectiveX, objectiveY);
            objectiveY += LETTER_H;
            UI.drawText(ctx, "    " + objectiveStatus, objectiveX, objectiveY);
        }
        objectiveY += LETTER_H;
        UI.drawText(ctx, "Gold: " + Game.gameInstance.resourceLiveCount.gold, objectiveX, objectiveY);
    }
    static #drawPlayers(ctx, entity) {
        const image = ImageCache.getImage("./media/sprites.png");
        if (!image.loaded) {
            return;
        }
        let spr = sprites.player_driller;
        const chCl = Game.gameInstance.playerConfig.get(entity.uid)?.chosenClass;
        if (chCl == PlayerConfig.CLASSES.DRILLER) {
            spr = sprites.player_driller;
        }
        if (chCl == PlayerConfig.CLASSES.ENGINEER) {
            spr = sprites.player_engineer;
        }
        if (chCl == PlayerConfig.CLASSES.SCOUT) {
            spr = sprites.player_scout;
        }
        if (chCl == PlayerConfig.CLASSES.GUNNER) {
            spr = sprites.player_gunner;
        }
        let chNo = sprites.player1;
        if (entity.uid == 0) {
            chNo = sprites.player1;
        }
        if (entity.uid == 1) {
            chNo = sprites.player2;
        }
        if (entity.uid == 2) {
            chNo = sprites.player3;
        }
        if (entity.uid == 3) {
            chNo = sprites.player4;
        }
        const left = entity.uid * sprites.player_bg.w;
        const top = TERRAIN_HEIGHT;
        ImageCache.drawTile(ctx, image, left, top, sprites.player_bg.x, sprites.player_bg.y, sprites.player_bg.w, sprites.player_bg.h, false, false);
        ImageCache.drawTile(ctx, image, left, top, spr.x, spr.y, spr.w, spr.h, false, false);
        ImageCache.drawTile(ctx, image, left, top + sprites.player_bg.h - chNo.h, chNo.x, chNo.y, chNo.w, chNo.h, false, false);
        let heartX = left + chNo.w;
        for (let i = 0; i < entity.maxHp; i += 20) {
            if (entity.hp < i) {
                break;
            }
            ImageCache.drawTile(ctx, image, heartX, top, sprites.heart.x, sprites.heart.y, sprites.heart.w, sprites.heart.h, false, false);
            heartX += sprites.heart.w;
        }
        if (entity.hp <= 0) {
            ctx.lineWidth = 3;
            ctx.strokeStyle = "#FF0000";
            ctx.beginPath();
            ctx.moveTo(left, top);
            ctx.lineTo(left + sprites.player_bg.w, top + sprites.player_bg.h);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(left, top + sprites.player_bg.h);
            ctx.lineTo(left + sprites.player_bg.w, top);
            ctx.stroke();
        }
    }
    static #drawWinCon(ctx) {
        let primaryClear = false;
        let secondaryClear = false;
        if (Game.gameInstance.missionConfig.chosenPrimary = ResourceConfig.PRIMARY_OBJECTIVE.MINING_EXPEDITION) {
            primaryClear = Game.gameInstance.resourceLiveCount.bismore >= Game.gameInstance.missionConfig.goalPrimary;
        }
        if (Game.gameInstance.missionConfig.chosenPrimary = ResourceConfig.PRIMARY_OBJECTIVE.EGG_HUNT) {
            primaryClear = Game.gameInstance.resourceLiveCount.egg >= Game.gameInstance.missionConfig.goalPrimary;
        }
        if (Game.gameInstance.missionConfig.chosenPrimary = ResourceConfig.PRIMARY_OBJECTIVE.POINT_EXTRACTION) {
            primaryClear = Game.gameInstance.resourceLiveCount.aquarq >= Game.gameInstance.missionConfig.goalPrimary;
        }
        if (Game.gameInstance.missionConfig.chosenSecondary = ResourceConfig.SECONDARY_OBJECTIVE.FOSSIL) {
            secondaryClear = Game.gameInstance.resourceLiveCount.fossil >= Game.gameInstance.missionConfig.goalSecondary;
        }
        if (primaryClear) {
            UI.drawText(ctx, "YOU WIN!! (no drop pod)", ctx.canvas.width / 2 - 72, 16);
            if (secondaryClear) {
                UI.drawText(ctx, "BONUS CLEAR!", ctx.canvas.width / 2 - 72, 32);
            }
        }
    }
    static drawText(ctx, text, x, y) {
        const image = ImageCache.getImage("./media/font-pixel-simplicity_grey.png");
        if (!image.loaded) {
            return;
        }
        for (let i = 0; i < text.length; i += 1) {
            const char = text.charAt(i);
            const fontLett = font[char];
            ImageCache.drawTile(ctx, image, x + i * LETTER_W, y, fontLett.x, fontLett.y, LETTER_W, LETTER_H, false, false);
        }
    }
}
export { UI };
//# sourceMappingURL=UI.mjs.map