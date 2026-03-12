/**
 * SpriteFactory.js
 * Generates ALL game textures programmatically using Phaser Graphics.
 * Visual style: TMNT Arcade (Konami 1989) — bold pixel art, chunky sprites, bright colors.
 * Base resolution: 480x270.
 */
class SpriteFactory {

    /* ===================================================================
     *  PUBLIC API
     * =================================================================*/
    static createAll(scene) {
        // Characters
        SpriteFactory._createRockstarIdle(scene);
        SpriteFactory._createRockstarWalkFrames(scene);
        SpriteFactory._createRockstarHurt(scene);
        SpriteFactory._createRockstarAttackFrames(scene);
        SpriteFactory._createRockstarTransformed(scene);

        // Grunge enemies
        SpriteFactory._createGrungeIdle(scene);
        SpriteFactory._createGrungeWalkFrames(scene);
        SpriteFactory._createGrungeAttack(scene);
        SpriteFactory._createGrungeHurt(scene);

        // Band members (Level 1 background)
        SpriteFactory._createBandBassist(scene);
        SpriteFactory._createBandGuitarist(scene);
        SpriteFactory._createBandDrummer(scene);

        // Concert fans (Level 1 foreground)
        SpriteFactory._createFans(scene);

        // Items
        SpriteFactory._createItemMoney(scene);
        SpriteFactory._createItemGoldRecord(scene);
        SpriteFactory._createItemStar(scene);
        SpriteFactory._createItemNote(scene);
        SpriteFactory._createItemBottle(scene);
        SpriteFactory._createItemSyringe(scene);
        SpriteFactory._createItemGuitar(scene);
        SpriteFactory._createItemVinyl(scene);

        // Weapons
        SpriteFactory._createMicStand(scene);

        // Dartboard mini-game
        SpriteFactory._createDartboard(scene);
        SpriteFactory._createDart(scene);
        SpriteFactory._createCrosshair(scene);

        // Backgrounds
        SpriteFactory._createBgStage(scene);
        SpriteFactory._createBgBar(scene);
        SpriteFactory._createBgAlley(scene);

        // Particles
        SpriteFactory._createParticleRain(scene);
        SpriteFactory._createParticleSpark(scene);

        // HUD
        SpriteFactory._createHealthBarFrame(scene);
        SpriteFactory._createHealthBarFill(scene);

        // Virtual buttons
        SpriteFactory._createBtnLeft(scene);
        SpriteFactory._createBtnRight(scene);
        SpriteFactory._createBtnAttack(scene);
        SpriteFactory._createBtnSpecial(scene);
    }

    /* ===================================================================
     *  COLOUR PALETTE  (TMNT-style bold arcade palette)
     * =================================================================*/
    static get PAL() {
        return {
            // Skin & hair
            skin:        0xE8B878,
            skinDark:    0xC49858,
            skinShadow:  0xA07840,
            redHair:     0xCC2200,
            crimsonHair: 0xFF3300,
            darkRedHair: 0x991100,
            brownHair:   0x5C3A1E,

            // Rockstar outfit
            orange:      0xFF8800,
            orangeDark:  0xCC6600,
            purple:      0x9B30FF,
            purpleDark:  0x6A0DAD,
            black:       0x111111,
            spandex:     0x1A1A2E,
            boot:        0x1A1A1A,
            beltBrown:   0x3D2B1F,
            studDot:     0x888888,

            // Grunge outfit
            flannel1:    0xCC3333,
            flannel2:    0x222222,
            flannelDark: 0x992222,
            denim:       0x4466AA,
            denimLight:  0x5A7FBA,
            denimDark:   0x334C7A,
            combatBoot:  0x3E2723,
            grungeHair:  0xC4A052,
            grungeHairDk:0x8B7532,

            // Band members
            bassBlue:    0x3388FF,
            bassPurple:  0x7733CC,
            guitarYellow:0xFFD700,
            guitarGreen: 0x33AA44,
            drumPink:    0xFF66AA,
            drumRed:     0xCC2244,

            // Items
            green:       0x33CC33,
            gold:        0xFFD700,
            yellow:      0xFFFF00,
            red:         0xFF3333,
            blue:        0x3366FF,
            brown:       0x8B4513,
            white:       0xFFFFFF,
            gray:        0x888888,
            darkGray:    0x444444,
            lightGray:   0xCCCCCC,

            // Backgrounds
            stageFloor:  0x5C3A1E,
            ampGray:     0x333333,
            neonPink:    0xFF1493,
            neonBlue:    0x00BFFF,
            neonGreen:   0x39FF14,

            // UI
            uiBg:        0x222222,
            healthGreen: 0x00FF00,
        };
    }

    /* ===================================================================
     *  HELPER:  fresh graphics context, auto-destroy after generateTexture
     * =================================================================*/
    static _tex(scene, key, w, h, drawFn) {
        if (scene.textures.exists(key)) return; // Already loaded from file
        var g = scene.add.graphics();
        drawFn(g, w, h);
        g.generateTexture(key, w, h);
        g.destroy();
    }

    /* ===================================================================
     *  ROCKSTAR — 64x64  (Massive red spiky hair, muscular, bare chest)
     * =================================================================*/

    static _drawRockstarBase(g, w, h, opts) {
        opts = opts || {};
        var P = SpriteFactory.PAL;
        var cx = w / 2;
        var legOff = opts.legOff || { lx: 0, rx: 0 };
        var armAngle = opts.armAngle || null;

        // --- Black pointed boots ---
        g.fillStyle(P.boot);
        // Left boot
        g.fillRect(cx - 12 + legOff.lx, 54, 10, 8);
        g.fillTriangle(cx - 14 + legOff.lx, 62, cx - 12 + legOff.lx, 54, cx - 12 + legOff.lx, 62);
        // Boot heel
        g.fillRect(cx - 4 + legOff.lx, 58, 3, 4);
        // Right boot
        g.fillRect(cx + 2 + legOff.rx, 54, 10, 8);
        g.fillTriangle(cx + 14 + legOff.rx, 62, cx + 12 + legOff.rx, 54, cx + 12 + legOff.rx, 62);
        g.fillRect(cx + 1 + legOff.rx, 58, 3, 4);

        // --- Legs (orange tight pants) ---
        g.fillStyle(P.orange);
        g.fillRect(cx - 10 + legOff.lx, 38, 9, 18);
        g.fillRect(cx + 1 + legOff.rx, 38, 9, 18);
        // Pant highlight
        g.fillStyle(0xFFAA33, 0.3);
        g.fillRect(cx - 8 + legOff.lx, 39, 3, 16);
        g.fillRect(cx + 3 + legOff.rx, 39, 3, 16);
        // Pant shadow
        g.fillStyle(P.orangeDark, 0.4);
        g.fillRect(cx - 3 + legOff.lx, 40, 2, 14);
        g.fillRect(cx + 8 + legOff.rx, 40, 2, 14);

        // --- Studded belt ---
        g.fillStyle(P.beltBrown);
        g.fillRect(cx - 13, 36, 26, 4);
        // Belt studs
        g.fillStyle(P.studDot);
        for (var i = 0; i < 7; i++) {
            g.fillRect(cx - 11 + i * 4, 37, 2, 2);
        }
        // Belt buckle
        g.fillStyle(P.gold);
        g.fillRect(cx - 3, 36, 6, 4);
        g.fillStyle(0xDAA520);
        g.fillRect(cx - 2, 37, 4, 2);

        // --- Torso (broad shoulders, bare chest with vest) ---
        // Vest on shoulders (dark purple/black)
        g.fillStyle(0x2A1040);
        g.fillRect(cx - 16, 19, 32, 19);
        // Shoulder pads for muscular look
        g.fillRect(cx - 18, 19, 4, 8);
        g.fillRect(cx + 14, 19, 4, 8);

        // Bare chest center (wide V opening)
        g.fillStyle(P.skin);
        // V-neck shape: wider at top, narrowing slightly
        g.fillRect(cx - 8, 20, 16, 16);
        g.fillTriangle(cx - 8, 20, cx, 17, cx + 8, 20);

        // Chest muscle definition
        g.lineStyle(1, P.skinDark, 0.5);
        // Pec lines
        g.lineBetween(cx - 6, 24, cx - 1, 26);
        g.lineBetween(cx + 6, 24, cx + 1, 26);
        // Center line
        g.lineBetween(cx, 22, cx, 32);
        // Ab lines
        g.lineStyle(1, P.skinDark, 0.35);
        g.lineBetween(cx - 4, 29, cx - 1, 29);
        g.lineBetween(cx + 1, 29, cx + 4, 29);
        g.lineBetween(cx - 4, 33, cx - 1, 33);
        g.lineBetween(cx + 1, 33, cx + 4, 33);

        // Vest lapel edges
        g.lineStyle(1, 0x1A0830);
        g.lineBetween(cx - 8, 20, cx - 8, 36);
        g.lineBetween(cx + 8, 20, cx + 8, 36);

        // --- Arms (muscular, skin with spiked wristbands) ---
        if (!armAngle) {
            // Left arm - bicep
            g.fillStyle(P.skin);
            g.fillRect(cx - 20, 20, 6, 8);
            g.fillRect(cx - 19, 28, 5, 8);
            // Bicep bulge
            g.fillRect(cx - 21, 22, 2, 5);
            // Left wristband
            g.fillStyle(P.black);
            g.fillRect(cx - 19, 34, 5, 3);
            g.fillStyle(P.studDot);
            g.fillRect(cx - 18, 35, 1, 1);
            g.fillRect(cx - 16, 35, 1, 1);

            // Right arm - bicep
            g.fillStyle(P.skin);
            g.fillRect(cx + 14, 20, 6, 8);
            g.fillRect(cx + 14, 28, 5, 8);
            g.fillRect(cx + 19, 22, 2, 5);
            // Right wristband
            g.fillStyle(P.black);
            g.fillRect(cx + 14, 34, 5, 3);
            g.fillStyle(P.studDot);
            g.fillRect(cx + 15, 35, 1, 1);
            g.fillRect(cx + 17, 35, 1, 1);
        } else {
            SpriteFactory._drawRockstarArm(g, cx, armAngle);
        }

        // --- Head ---
        g.fillStyle(P.skin);
        g.fillCircle(cx, 14, 9);
        // Jaw/chin definition
        g.fillRect(cx - 6, 16, 12, 4);

        // Eyes (angry/fierce)
        g.fillStyle(P.white);
        g.fillRect(cx - 6, 11, 4, 3);
        g.fillRect(cx + 2, 11, 4, 3);
        // Pupils
        g.fillStyle(P.black);
        g.fillRect(cx - 5, 12, 2, 2);
        g.fillRect(cx + 3, 12, 2, 2);
        // Angry eyebrows (angular, pointing inward)
        g.fillStyle(P.darkRedHair);
        g.fillRect(cx - 7, 9, 5, 2);
        g.fillRect(cx + 2, 9, 5, 2);
        // Angled inner part for fierce look
        g.fillRect(cx - 3, 10, 2, 1);
        g.fillRect(cx + 1, 10, 2, 1);

        // Nose
        g.fillStyle(P.skinDark);
        g.fillRect(cx - 1, 14, 2, 2);

        // Mouth (fierce grimace)
        g.fillStyle(P.black);
        g.fillRect(cx - 3, 18, 6, 1);
        g.fillStyle(P.white, 0.7);
        g.fillRect(cx - 2, 18, 4, 1);

        // --- MASSIVE SPIKY RED HAIR ---
        SpriteFactory._drawBigHair(g, cx);
    }

    static _drawBigHair(g, cx) {
        var P = SpriteFactory.PAL;

        // Main hair mass — deep red base
        g.fillStyle(P.redHair);
        g.fillCircle(cx, 4, 14);
        g.fillCircle(cx - 8, 6, 10);
        g.fillCircle(cx + 8, 6, 10);
        // Extra volume on sides flowing down
        g.fillRect(cx - 20, 4, 8, 18);
        g.fillRect(cx + 12, 4, 8, 18);
        // Back hair volume
        g.fillCircle(cx - 12, 10, 8);
        g.fillCircle(cx + 12, 10, 8);

        // Crimson highlights layer
        g.fillStyle(P.crimsonHair);
        g.fillCircle(cx, 3, 11);
        g.fillCircle(cx - 6, 5, 7);
        g.fillCircle(cx + 6, 5, 7);

        // Radiating spiky triangles — at least 10 spikes
        g.fillStyle(P.crimsonHair);
        // Top center spike (tallest)
        g.fillTriangle(cx - 3, -2, cx, -12, cx + 3, -2);
        // Top-left spike
        g.fillTriangle(cx - 7, -1, cx - 5, -10, cx - 2, -1);
        // Top-right spike
        g.fillTriangle(cx + 2, -1, cx + 5, -10, cx + 7, -1);
        // Upper-left spike
        g.fillTriangle(cx - 11, 0, cx - 10, -7, cx - 6, 0);
        // Upper-right spike
        g.fillTriangle(cx + 6, 0, cx + 10, -7, cx + 11, 0);
        // Left side spike (horizontal-ish)
        g.fillTriangle(cx - 16, 2, cx - 26, -2, cx - 16, 8);
        // Right side spike
        g.fillTriangle(cx + 16, 2, cx + 26, -2, cx + 16, 8);
        // Lower-left side spike
        g.fillTriangle(cx - 18, 8, cx - 28, 5, cx - 18, 14);
        // Lower-right side spike
        g.fillTriangle(cx + 18, 8, cx + 28, 5, cx + 18, 14);
        // Back-left spike angled down
        g.fillTriangle(cx - 20, 14, cx - 26, 12, cx - 18, 20);
        // Back-right spike angled down
        g.fillTriangle(cx + 20, 14, cx + 26, 12, cx + 18, 20);

        // Dark red depth at base of hair
        g.fillStyle(P.darkRedHair, 0.6);
        g.fillRect(cx - 18, 12, 6, 10);
        g.fillRect(cx + 12, 12, 6, 10);

        // Bright crimson highlight streaks on spikes
        g.lineStyle(1, 0xFF5533, 0.5);
        g.lineBetween(cx - 1, -2, cx, -9);
        g.lineBetween(cx - 6, -1, cx - 5, -7);
        g.lineBetween(cx + 5, -1, cx + 5, -7);
        g.lineBetween(cx - 15, 4, cx - 23, 1);
        g.lineBetween(cx + 15, 4, cx + 23, 1);

        // Subtle white shine on top
        g.lineStyle(1, P.white, 0.15);
        g.lineBetween(cx - 3, -4, cx - 1, 2);
        g.lineBetween(cx + 2, -3, cx + 3, 3);
    }

    static _drawRockstarArm(g, cx, angle) {
        var P = SpriteFactory.PAL;
        // Left arm always resting (muscular)
        g.fillStyle(P.skin);
        g.fillRect(cx - 20, 20, 6, 8);
        g.fillRect(cx - 19, 28, 5, 8);
        g.fillRect(cx - 21, 22, 2, 5);
        // Left wristband
        g.fillStyle(P.black);
        g.fillRect(cx - 19, 34, 5, 3);
        g.fillStyle(P.studDot);
        g.fillRect(cx - 18, 35, 1, 1);
        g.fillRect(cx - 16, 35, 1, 1);

        // Right arm at different angles — swinging mic stand
        if (angle === 'side') {
            g.fillStyle(P.skin);
            g.fillRect(cx + 14, 20, 6, 8);
            g.fillRect(cx + 14, 28, 5, 8);
            g.fillRect(cx + 19, 22, 2, 5);
            // Wristband
            g.fillStyle(P.black);
            g.fillRect(cx + 14, 34, 5, 3);
            // Mic stand at side
            g.lineStyle(2, P.gray);
            g.lineBetween(cx + 19, 30, cx + 28, 30);
            g.fillStyle(P.darkGray);
            g.fillCircle(cx + 30, 30, 3);
        } else if (angle === '45') {
            g.fillStyle(P.skin);
            g.fillRect(cx + 14, 18, 6, 6);
            g.fillRect(cx + 18, 16, 8, 5);
            g.fillRect(cx + 24, 14, 6, 5);
            // Wristband
            g.fillStyle(P.black);
            g.fillRect(cx + 24, 14, 5, 3);
            // Mic stand swinging
            g.lineStyle(2, P.gray);
            g.lineBetween(cx + 28, 16, cx + 40, 8);
            g.fillStyle(P.darkGray);
            g.fillCircle(cx + 42, 7, 3);
        } else if (angle === 'forward') {
            g.fillStyle(P.skin);
            g.fillRect(cx + 14, 18, 6, 5);
            g.fillRect(cx + 18, 16, 16, 5);
            g.fillRect(cx + 32, 16, 6, 5);
            // Wristband
            g.fillStyle(P.black);
            g.fillRect(cx + 32, 17, 5, 3);
            // Mic stand fully extended
            g.lineStyle(2, P.gray);
            g.lineBetween(cx + 36, 19, cx + 48, 19);
            g.fillStyle(P.darkGray);
            g.fillCircle(cx + 50, 19, 3);
        }
    }

    static _createRockstarIdle(scene) {
        SpriteFactory._tex(scene, 'rockstar-idle', 64, 64, function(g) {
            SpriteFactory._drawRockstarBase(g, 64, 64);
        });
    }

    static _createRockstarWalkFrames(scene) {
        var offsets = [
            { lx: -3, rx: 3 },
            { lx: -5, rx: 5 },
            { lx: 3, rx: -3 },
            { lx: 5, rx: -5 },
        ];
        for (var i = 0; i < 4; i++) {
            (function(idx, off) {
                SpriteFactory._tex(scene, 'rockstar-walk-' + (idx + 1), 64, 64, function(g) {
                    SpriteFactory._drawRockstarBase(g, 64, 64, { legOff: off });
                });
            })(i, offsets[i]);
        }
    }

    static _createRockstarHurt(scene) {
        SpriteFactory._tex(scene, 'rockstar-hurt', 64, 64, function(g) {
            SpriteFactory._drawRockstarBase(g, 64, 64);
            // Red flash overlay
            g.fillStyle(0xFF0000, 0.4);
            g.fillRect(0, 0, 64, 64);
        });
    }

    static _createRockstarAttackFrames(scene) {
        var angles = ['side', '45', 'forward'];
        for (var i = 0; i < 3; i++) {
            (function(idx, ang) {
                SpriteFactory._tex(scene, 'rockstar-attack-' + (idx + 1), 64, 64, function(g) {
                    SpriteFactory._drawRockstarBase(g, 64, 64, { armAngle: ang });
                });
            })(i, angles[i]);
        }
    }

    static _createRockstarTransformed(scene) {
        var P = SpriteFactory.PAL;
        SpriteFactory._tex(scene, 'rockstar-transformed', 64, 64, function(g, w, h) {
            var cx = w / 2;

            // --- Normal shoes ---
            g.fillStyle(P.darkGray);
            g.fillRect(cx - 11, 55, 9, 7);
            g.fillRect(cx + 2, 55, 9, 7);

            // --- Blue jeans ---
            g.fillStyle(P.denim);
            g.fillRect(cx - 10, 38, 9, 18);
            g.fillRect(cx + 1, 38, 9, 18);
            g.lineStyle(1, P.denimLight, 0.4);
            g.lineBetween(cx - 6, 38, cx - 6, 56);
            g.lineBetween(cx + 5, 38, cx + 5, 56);

            // --- White t-shirt ---
            g.fillStyle(P.white);
            g.fillRect(cx - 14, 20, 28, 20);
            g.lineStyle(1, P.lightGray);
            g.lineBetween(cx - 6, 20, cx + 6, 20);
            g.lineBetween(cx - 14, 22, cx - 14, 28);
            g.lineBetween(cx + 14, 22, cx + 14, 28);

            // Belt
            g.fillStyle(P.brown);
            g.fillRect(cx - 12, 37, 24, 3);

            // --- Arms ---
            g.fillStyle(P.skin);
            g.fillRect(cx - 18, 26, 5, 14);
            g.fillRect(cx + 13, 26, 5, 14);

            // --- Head ---
            g.fillStyle(P.skin);
            g.fillCircle(cx, 14, 9);

            // Eyes
            g.fillStyle(P.black);
            g.fillRect(cx - 5, 12, 3, 3);
            g.fillRect(cx + 2, 12, 3, 3);
            g.fillStyle(P.white);
            g.fillRect(cx - 4, 12, 1, 2);
            g.fillRect(cx + 3, 12, 1, 2);

            // Slight smile
            g.lineStyle(1, P.brownHair);
            g.lineBetween(cx - 2, 18, cx + 2, 18);

            // --- Short brown hair ---
            g.fillStyle(P.brownHair);
            g.fillCircle(cx, 8, 10);
            g.fillStyle(P.skin);
            g.fillRect(cx - 11, 11, 22, 10);
            g.fillStyle(P.skin);
            g.fillCircle(cx, 14, 9);
            // Re-draw eyes
            g.fillStyle(P.black);
            g.fillRect(cx - 5, 12, 3, 3);
            g.fillRect(cx + 2, 12, 3, 3);
            g.fillStyle(P.white);
            g.fillRect(cx - 4, 12, 1, 2);
            g.fillRect(cx + 3, 12, 1, 2);
            g.lineStyle(1, P.brownHair);
            g.lineBetween(cx - 2, 18, cx + 2, 18);
        });
    }

    /* ===================================================================
     *  GRUNGE ENEMY — 48x48  (TMNT-quality arcade enemies)
     * =================================================================*/

    static _drawGrungeBase(g, w, h, opts) {
        opts = opts || {};
        var P = SpriteFactory.PAL;
        var cx = w / 2;
        var legOff = opts.legOff || { lx: 0, rx: 0 };
        var attacking = opts.attacking || false;
        var hurt = opts.hurt || false;
        var bodyTilt = hurt ? 4 : 0;

        // --- Chunky combat boots ---
        g.fillStyle(P.combatBoot);
        // Left boot
        g.fillRect(cx - 10 + legOff.lx + bodyTilt, 39, 9, 7);
        g.fillRect(cx + 1 + legOff.rx + bodyTilt, 39, 9, 7);
        // Boot soles (thick)
        g.fillStyle(P.black);
        g.fillRect(cx - 11 + legOff.lx + bodyTilt, 45, 11, 3);
        g.fillRect(cx + 0 + legOff.rx + bodyTilt, 45, 11, 3);
        // Sole tread marks
        g.fillStyle(P.combatBoot, 0.5);
        g.fillRect(cx - 9 + legOff.lx + bodyTilt, 46, 2, 1);
        g.fillRect(cx - 5 + legOff.lx + bodyTilt, 46, 2, 1);
        g.fillRect(cx + 2 + legOff.rx + bodyTilt, 46, 2, 1);
        g.fillRect(cx + 6 + legOff.rx + bodyTilt, 46, 2, 1);
        // Boot laces
        g.lineStyle(1, 0x555544, 0.6);
        g.lineBetween(cx - 7 + legOff.lx + bodyTilt, 40, cx - 5 + legOff.lx + bodyTilt, 41);
        g.lineBetween(cx - 7 + legOff.lx + bodyTilt, 42, cx - 5 + legOff.lx + bodyTilt, 43);
        g.lineBetween(cx + 4 + legOff.rx + bodyTilt, 40, cx + 6 + legOff.rx + bodyTilt, 41);
        g.lineBetween(cx + 4 + legOff.rx + bodyTilt, 42, cx + 6 + legOff.rx + bodyTilt, 43);

        // --- Ripped jeans ---
        g.fillStyle(P.denim);
        g.fillRect(cx - 9 + legOff.lx + bodyTilt, 27, 8, 14);
        g.fillRect(cx + 1 + legOff.rx + bodyTilt, 27, 8, 14);
        // Jean seams
        g.lineStyle(1, P.denimDark, 0.4);
        g.lineBetween(cx - 5 + legOff.lx + bodyTilt, 27, cx - 5 + legOff.lx + bodyTilt, 41);
        g.lineBetween(cx + 5 + legOff.rx + bodyTilt, 27, cx + 5 + legOff.rx + bodyTilt, 41);
        // Knee rips (skin showing through)
        g.fillStyle(P.skin, 0.8);
        g.fillRect(cx - 7 + legOff.lx + bodyTilt, 33, 4, 3);
        g.fillRect(cx + 3 + legOff.rx + bodyTilt, 35, 4, 2);
        // Frayed edges around rips
        g.lineStyle(1, P.denimLight, 0.5);
        g.lineBetween(cx - 7 + legOff.lx + bodyTilt, 33, cx - 3 + legOff.lx + bodyTilt, 33);
        g.lineBetween(cx - 7 + legOff.lx + bodyTilt, 36, cx - 3 + legOff.lx + bodyTilt, 36);
        g.lineBetween(cx + 3 + legOff.rx + bodyTilt, 35, cx + 7 + legOff.rx + bodyTilt, 35);

        // --- Flannel shirt (proper checkerboard pattern) ---
        var shirtX = cx - 12 + bodyTilt;
        var shirtY = 12;
        var shirtW = 24;
        var shirtH = 17;

        // Base flannel red
        g.fillStyle(P.flannel1);
        g.fillRect(shirtX, shirtY, shirtW, shirtH);

        // Checkerboard pattern (3px squares)
        for (var row = 0; row < 6; row++) {
            for (var col = 0; col < 8; col++) {
                if ((row + col) % 2 === 0) {
                    g.fillStyle(P.flannel2);
                    g.fillRect(shirtX + col * 3, shirtY + row * 3, 3, 3);
                }
            }
        }

        // Shirt collar (V-shape)
        g.fillStyle(P.flannel1);
        g.fillTriangle(cx - 3 + bodyTilt, shirtY, cx + bodyTilt, shirtY + 4, cx + 3 + bodyTilt, shirtY);

        // Rolled-up sleeves showing forearms
        g.fillStyle(P.flannel1);
        g.fillRect(cx - 15 + bodyTilt, shirtY + 2, 4, 6);
        g.fillRect(cx + 12 + bodyTilt, shirtY + 2, 4, 6);
        // Forearm skin
        g.fillStyle(P.skin);
        g.fillRect(cx - 15 + bodyTilt, shirtY + 8, 4, 6);
        g.fillRect(cx + 12 + bodyTilt, shirtY + 8, 4, 6);

        // --- Arms ---
        if (attacking) {
            // Left arm resting
            g.fillStyle(P.flannel1);
            g.fillRect(cx - 15 + bodyTilt, shirtY + 2, 4, 6);
            g.fillStyle(P.skin);
            g.fillRect(cx - 15 + bodyTilt, shirtY + 8, 4, 6);
            // Right arm extended (punch)
            g.fillStyle(P.flannel1);
            g.fillRect(cx + 12 + bodyTilt, shirtY + 1, 4, 5);
            g.fillStyle(P.skin);
            g.fillRect(cx + 15 + bodyTilt, shirtY, 10, 5);
            // Fist
            g.fillStyle(P.skin);
            g.fillRect(cx + 23 + bodyTilt, shirtY - 1, 5, 6);
            // Fist outline
            g.lineStyle(1, P.skinDark, 0.5);
            g.lineBetween(cx + 23 + bodyTilt, shirtY + 1, cx + 27 + bodyTilt, shirtY + 1);
        }

        // Slouchy posture — slight hunch (shirt wrinkle lines)
        g.lineStyle(1, P.flannelDark, 0.3);
        g.lineBetween(shirtX + 4, shirtY + 5, shirtX + 8, shirtY + 8);
        g.lineBetween(shirtX + 16, shirtY + 5, shirtX + 12, shirtY + 8);

        // --- Head (slightly hunched forward) ---
        g.fillStyle(P.skin);
        g.fillCircle(cx + bodyTilt, 8, 7);

        // Scowling face
        // Eyes (narrow, angry)
        g.fillStyle(P.white);
        g.fillRect(cx - 4 + bodyTilt, 6, 3, 2);
        g.fillRect(cx + 1 + bodyTilt, 6, 3, 2);
        g.fillStyle(P.black);
        g.fillRect(cx - 3 + bodyTilt, 6, 2, 2);
        g.fillRect(cx + 2 + bodyTilt, 6, 2, 2);
        // Angry eyebrows (thick, angled inward)
        g.fillStyle(P.grungeHairDk);
        g.fillRect(cx - 5 + bodyTilt, 4, 4, 2);
        g.fillRect(cx + 1 + bodyTilt, 4, 4, 2);
        g.fillRect(cx - 2 + bodyTilt, 5, 2, 1);
        g.fillRect(cx + bodyTilt, 5, 2, 1);

        // Nose
        g.fillStyle(P.skinDark);
        g.fillRect(cx - 1 + bodyTilt, 8, 2, 2);

        // Scowling mouth
        g.fillStyle(P.black);
        g.lineBetween(cx - 2 + bodyTilt, 12, cx - 1 + bodyTilt, 13);
        g.lineBetween(cx - 1 + bodyTilt, 13, cx + 1 + bodyTilt, 13);
        g.lineBetween(cx + 1 + bodyTilt, 13, cx + 2 + bodyTilt, 12);

        // Stubble
        g.fillStyle(P.grungeHairDk, 0.3);
        g.fillRect(cx - 3 + bodyTilt, 10, 1, 1);
        g.fillRect(cx + 2 + bodyTilt, 11, 1, 1);
        g.fillRect(cx - 1 + bodyTilt, 11, 1, 1);
        g.fillRect(cx + bodyTilt, 12, 1, 1);

        // --- Wavy shoulder-length hair ---
        // Main hair mass
        g.fillStyle(P.grungeHair);
        g.fillCircle(cx + bodyTilt, 3, 8);
        // Left side hair (wavy — overlapping curved shapes)
        g.fillRect(cx - 8 + bodyTilt, 2, 5, 14);
        g.fillCircle(cx - 8 + bodyTilt, 8, 4);
        g.fillCircle(cx - 9 + bodyTilt, 12, 3);
        g.fillRect(cx - 10 + bodyTilt, 5, 3, 12);
        // Right side hair
        g.fillRect(cx + 3 + bodyTilt, 2, 5, 14);
        g.fillCircle(cx + 8 + bodyTilt, 8, 4);
        g.fillCircle(cx + 9 + bodyTilt, 12, 3);
        g.fillRect(cx + 7 + bodyTilt, 5, 3, 12);

        // Darker lowlights for depth
        g.fillStyle(P.grungeHairDk, 0.5);
        g.fillRect(cx - 9 + bodyTilt, 10, 2, 6);
        g.fillRect(cx + 7 + bodyTilt, 10, 2, 6);
        g.fillCircle(cx - 7 + bodyTilt, 14, 2);
        g.fillCircle(cx + 7 + bodyTilt, 14, 2);

        // Messy wisps
        g.lineStyle(1, P.grungeHair, 0.7);
        g.lineBetween(cx - 10 + bodyTilt, 7, cx - 12 + bodyTilt, 16);
        g.lineBetween(cx + 10 + bodyTilt, 7, cx + 12 + bodyTilt, 16);
        g.lineBetween(cx - 4 + bodyTilt, -2, cx - 6 + bodyTilt, -5);
        g.lineBetween(cx + 3 + bodyTilt, -2, cx + 5 + bodyTilt, -4);
        g.lineBetween(cx + bodyTilt, -3, cx + 1 + bodyTilt, -6);

        // Hair highlight streaks
        g.lineStyle(1, 0xD4B862, 0.3);
        g.lineBetween(cx - 6 + bodyTilt, 1, cx - 7 + bodyTilt, 10);
        g.lineBetween(cx + 5 + bodyTilt, 1, cx + 6 + bodyTilt, 10);
    }

    static _createGrungeIdle(scene) {
        SpriteFactory._tex(scene, 'grunge-idle', 48, 48, function(g) {
            SpriteFactory._drawGrungeBase(g, 48, 48);
        });
    }

    static _createGrungeWalkFrames(scene) {
        var offsets = [
            { lx: -2, rx: 2 },
            { lx: -4, rx: 4 },
            { lx: 2, rx: -2 },
            { lx: 4, rx: -4 },
        ];
        for (var i = 0; i < 4; i++) {
            (function(idx, off) {
                SpriteFactory._tex(scene, 'grunge-walk-' + (idx + 1), 48, 48, function(g) {
                    SpriteFactory._drawGrungeBase(g, 48, 48, { legOff: off });
                });
            })(i, offsets[i]);
        }
    }

    static _createGrungeAttack(scene) {
        SpriteFactory._tex(scene, 'grunge-attack', 48, 48, function(g) {
            SpriteFactory._drawGrungeBase(g, 48, 48, { attacking: true });
        });
    }

    static _createGrungeHurt(scene) {
        SpriteFactory._tex(scene, 'grunge-hurt', 48, 48, function(g) {
            SpriteFactory._drawGrungeBase(g, 48, 48, { hurt: true });
        });
    }

    /* ===================================================================
     *  BAND MEMBERS — 48x64 each, 2 frames (Level 1 background)
     * =================================================================*/

    static _drawBandMemberBase(g, w, h, opts) {
        var P = SpriteFactory.PAL;
        var cx = w / 2;
        var sway = opts.sway || 0;
        var hairColor = opts.hairColor;
        var hairDark = opts.hairDark;
        var outfitColor = opts.outfitColor;
        var outfitDark = opts.outfitDark;

        // --- Boots ---
        g.fillStyle(P.boot);
        g.fillRect(cx - 9 + sway, 54, 8, 8);
        g.fillRect(cx + 1 + sway, 54, 8, 8);

        // --- Legs ---
        g.fillStyle(P.black);
        g.fillRect(cx - 8 + sway, 40, 7, 16);
        g.fillRect(cx + 1 + sway, 40, 7, 16);

        // --- Torso ---
        g.fillStyle(outfitColor);
        g.fillRect(cx - 12 + sway, 20, 24, 22);
        // Outfit shadow
        g.fillStyle(outfitDark, 0.4);
        g.fillRect(cx - 12 + sway, 34, 24, 6);

        // --- Head ---
        g.fillStyle(P.skin);
        g.fillCircle(cx + sway, 15, 7);

        // Eyes
        g.fillStyle(P.black);
        g.fillRect(cx - 3 + sway, 13, 2, 2);
        g.fillRect(cx + 1 + sway, 13, 2, 2);

        // Mouth
        g.fillStyle(P.black);
        g.fillRect(cx - 2 + sway, 18, 4, 1);

        // --- Spiky hair ---
        g.fillStyle(hairColor);
        g.fillCircle(cx + sway, 9, 9);
        // Spikes
        g.fillTriangle(cx - 2 + sway, 2, cx + sway, -6, cx + 2 + sway, 2);
        g.fillTriangle(cx - 6 + sway, 3, cx - 4 + sway, -4, cx - 1 + sway, 3);
        g.fillTriangle(cx + 1 + sway, 3, cx + 4 + sway, -4, cx + 6 + sway, 3);
        g.fillTriangle(cx - 9 + sway, 5, cx - 12 + sway, 0, cx - 7 + sway, 3);
        g.fillTriangle(cx + 7 + sway, 3, cx + 12 + sway, 0, cx + 9 + sway, 5);
        // Side hair
        g.fillRect(cx - 10 + sway, 6, 4, 10);
        g.fillRect(cx + 6 + sway, 6, 4, 10);
        // Hair depth
        g.fillStyle(hairDark, 0.4);
        g.fillRect(cx - 10 + sway, 12, 3, 4);
        g.fillRect(cx + 7 + sway, 12, 3, 4);
    }

    static _createBandBassist(scene) {
        var P = SpriteFactory.PAL;
        // Frame 1
        SpriteFactory._tex(scene, 'band-bassist-1', 48, 64, function(g) {
            SpriteFactory._drawBandMemberBase(g, 48, 64, {
                sway: -1,
                hairColor: P.bassBlue, hairDark: 0x2266CC,
                outfitColor: P.bassPurple, outfitDark: 0x551199
            });
            // Bass guitar
            var cx = 24;
            var sway = -1;
            // Neck (long vertical)
            g.fillStyle(0x8B4513);
            g.fillRect(cx + 6 + sway, 8, 3, 36);
            // Body
            g.fillStyle(0x444444);
            g.fillCircle(cx + 7 + sway, 38, 6);
            g.fillCircle(cx + 7 + sway, 44, 5);
            // Strings
            g.lineStyle(1, P.lightGray, 0.4);
            g.lineBetween(cx + 7 + sway, 10, cx + 7 + sway, 42);
            // Headstock
            g.fillStyle(P.black);
            g.fillRect(cx + 5 + sway, 6, 5, 4);
            // Left arm over bass
            g.fillStyle(P.skin);
            g.fillRect(cx - 13 + sway, 22, 4, 10);
            g.fillRect(cx - 11 + sway, 30, 4, 4);
            // Right arm strumming
            g.fillStyle(P.skin);
            g.fillRect(cx + 12 + sway, 28, 4, 10);
        });
        // Frame 2
        SpriteFactory._tex(scene, 'band-bassist-2', 48, 64, function(g) {
            SpriteFactory._drawBandMemberBase(g, 48, 64, {
                sway: 1,
                hairColor: P.bassBlue, hairDark: 0x2266CC,
                outfitColor: P.bassPurple, outfitDark: 0x551199
            });
            var cx = 24;
            var sway = 1;
            g.fillStyle(0x8B4513);
            g.fillRect(cx + 6 + sway, 8, 3, 36);
            g.fillStyle(0x444444);
            g.fillCircle(cx + 7 + sway, 38, 6);
            g.fillCircle(cx + 7 + sway, 44, 5);
            g.lineStyle(1, P.lightGray, 0.4);
            g.lineBetween(cx + 7 + sway, 10, cx + 7 + sway, 42);
            g.fillStyle(P.black);
            g.fillRect(cx + 5 + sway, 6, 5, 4);
            g.fillStyle(P.skin);
            g.fillRect(cx - 13 + sway, 24, 4, 10);
            g.fillRect(cx - 11 + sway, 32, 4, 4);
            g.fillStyle(P.skin);
            g.fillRect(cx + 12 + sway, 26, 4, 10);
        });
    }

    static _createBandGuitarist(scene) {
        var P = SpriteFactory.PAL;
        // Frame 1
        SpriteFactory._tex(scene, 'band-guitarist-1', 48, 64, function(g) {
            SpriteFactory._drawBandMemberBase(g, 48, 64, {
                sway: -2,
                hairColor: P.guitarYellow, hairDark: 0xCC9900,
                outfitColor: P.guitarGreen, outfitDark: 0x227733
            });
            var cx = 24;
            var sway = -2;
            // V-shaped guitar body
            g.fillStyle(0xCC0000);
            g.fillTriangle(cx + 2 + sway, 30, cx + 16 + sway, 40, cx + 2 + sway, 40);
            g.fillTriangle(cx + 2 + sway, 30, cx - 10 + sway, 42, cx + 2 + sway, 42);
            // Guitar neck
            g.fillStyle(0x8B4513);
            g.fillRect(cx + sway, 10, 3, 22);
            // Headstock
            g.fillStyle(P.black);
            g.fillRect(cx - 1 + sway, 7, 5, 4);
            // Strings
            g.lineStyle(1, P.lightGray, 0.3);
            g.lineBetween(cx + 1 + sway, 10, cx + 1 + sway, 36);
            // Left arm on neck
            g.fillStyle(P.skin);
            g.fillRect(cx - 13 + sway, 22, 4, 8);
            // Right arm strumming
            g.fillStyle(P.skin);
            g.fillRect(cx + 12 + sway, 30, 4, 8);
        });
        // Frame 2 (rocking back)
        SpriteFactory._tex(scene, 'band-guitarist-2', 48, 64, function(g) {
            SpriteFactory._drawBandMemberBase(g, 48, 64, {
                sway: 2,
                hairColor: P.guitarYellow, hairDark: 0xCC9900,
                outfitColor: P.guitarGreen, outfitDark: 0x227733
            });
            var cx = 24;
            var sway = 2;
            g.fillStyle(0xCC0000);
            g.fillTriangle(cx + 2 + sway, 30, cx + 16 + sway, 40, cx + 2 + sway, 40);
            g.fillTriangle(cx + 2 + sway, 30, cx - 10 + sway, 42, cx + 2 + sway, 42);
            g.fillStyle(0x8B4513);
            g.fillRect(cx + sway, 10, 3, 22);
            g.fillStyle(P.black);
            g.fillRect(cx - 1 + sway, 7, 5, 4);
            g.lineStyle(1, P.lightGray, 0.3);
            g.lineBetween(cx + 1 + sway, 10, cx + 1 + sway, 36);
            g.fillStyle(P.skin);
            g.fillRect(cx - 13 + sway, 20, 4, 8);
            g.fillStyle(P.skin);
            g.fillRect(cx + 12 + sway, 32, 4, 8);
        });
    }

    static _createBandDrummer(scene) {
        var P = SpriteFactory.PAL;
        // Frame 1 (arms up)
        SpriteFactory._tex(scene, 'band-drummer-1', 48, 64, function(g) {
            var cx = 24;
            // Drum kit behind the drummer
            // Bass drum
            g.fillStyle(P.drumRed);
            g.fillCircle(cx, 50, 10);
            g.fillStyle(0xAA1133);
            g.fillCircle(cx, 50, 7);
            // Tom drums
            g.fillStyle(P.drumRed);
            g.fillCircle(cx - 10, 40, 6);
            g.fillCircle(cx + 10, 40, 6);
            g.fillStyle(0xAA1133);
            g.fillCircle(cx - 10, 40, 4);
            g.fillCircle(cx + 10, 40, 4);
            // Cymbal stands
            g.lineStyle(1, P.gray);
            g.lineBetween(cx - 18, 44, cx - 18, 28);
            g.lineBetween(cx + 18, 44, cx + 18, 28);
            // Cymbals
            g.fillStyle(P.gold, 0.8);
            g.fillEllipse(cx - 18, 27, 12, 3);
            g.fillEllipse(cx + 18, 27, 12, 3);
            // Hi-hat
            g.fillStyle(P.gold, 0.7);
            g.fillEllipse(cx - 14, 32, 8, 2);
            g.fillEllipse(cx - 14, 34, 8, 2);

            // Drummer body (seated)
            SpriteFactory._drawBandMemberBase(g, 48, 64, {
                sway: 0,
                hairColor: P.drumPink, hairDark: 0xCC4488,
                outfitColor: P.drumRed, outfitDark: 0x991133
            });

            // Arms up with drumsticks
            g.fillStyle(P.skin);
            g.fillRect(cx - 14, 18, 4, 6);
            g.fillRect(cx - 15, 14, 4, 6);
            g.fillRect(cx + 10, 18, 4, 6);
            g.fillRect(cx + 11, 14, 4, 6);
            // Drumsticks
            g.lineStyle(2, 0xDEB887);
            g.lineBetween(cx - 14, 13, cx - 10, 8);
            g.lineBetween(cx + 14, 13, cx + 10, 8);
        });
        // Frame 2 (arms down hitting)
        SpriteFactory._tex(scene, 'band-drummer-2', 48, 64, function(g) {
            var cx = 24;
            // Drum kit
            g.fillStyle(P.drumRed);
            g.fillCircle(cx, 50, 10);
            g.fillStyle(0xAA1133);
            g.fillCircle(cx, 50, 7);
            g.fillStyle(P.drumRed);
            g.fillCircle(cx - 10, 40, 6);
            g.fillCircle(cx + 10, 40, 6);
            g.fillStyle(0xAA1133);
            g.fillCircle(cx - 10, 40, 4);
            g.fillCircle(cx + 10, 40, 4);
            g.lineStyle(1, P.gray);
            g.lineBetween(cx - 18, 44, cx - 18, 28);
            g.lineBetween(cx + 18, 44, cx + 18, 28);
            g.fillStyle(P.gold, 0.8);
            g.fillEllipse(cx - 18, 27, 12, 3);
            g.fillEllipse(cx + 18, 27, 12, 3);
            g.fillStyle(P.gold, 0.7);
            g.fillEllipse(cx - 14, 32, 8, 2);
            g.fillEllipse(cx - 14, 34, 8, 2);

            SpriteFactory._drawBandMemberBase(g, 48, 64, {
                sway: 0,
                hairColor: P.drumPink, hairDark: 0xCC4488,
                outfitColor: P.drumRed, outfitDark: 0x991133
            });

            // Arms down hitting drums
            g.fillStyle(P.skin);
            g.fillRect(cx - 14, 20, 4, 8);
            g.fillRect(cx - 13, 26, 4, 6);
            g.fillRect(cx + 10, 20, 4, 8);
            g.fillRect(cx + 11, 26, 4, 6);
            // Drumsticks hitting
            g.lineStyle(2, 0xDEB887);
            g.lineBetween(cx - 12, 30, cx - 8, 38);
            g.lineBetween(cx + 12, 30, cx + 8, 38);
        });
    }

    /* ===================================================================
     *  CONCERT FANS — 24x32, silhouette style (Level 1 foreground)
     * =================================================================*/

    static _createFans(scene) {
        var P = SpriteFactory.PAL;

        // Fan 1: Arms raised, red shirt
        SpriteFactory._tex(scene, 'fan-1-a', 24, 32, function(g) {
            // Body silhouette (from behind)
            g.fillStyle(0x1A1A1A);
            g.fillRect(4, 16, 16, 16);
            // Head
            g.fillCircle(12, 13, 6);
            // Hair (messy dark)
            g.fillStyle(0x222222);
            g.fillCircle(12, 11, 6);
            // Shirt color hint
            g.fillStyle(0xCC2222, 0.4);
            g.fillRect(5, 18, 14, 10);
            // Arms raised up
            g.fillStyle(0x1A1A1A);
            g.fillRect(2, 4, 3, 14);
            g.fillRect(19, 4, 3, 14);
            // Hands/fists at top
            g.fillRect(1, 2, 4, 4);
            g.fillRect(19, 2, 4, 4);
        });
        SpriteFactory._tex(scene, 'fan-1-b', 24, 32, function(g) {
            g.fillStyle(0x1A1A1A);
            g.fillRect(4, 16, 16, 16);
            g.fillCircle(12, 13, 6);
            g.fillStyle(0x222222);
            g.fillCircle(12, 11, 6);
            g.fillStyle(0xCC2222, 0.4);
            g.fillRect(5, 18, 14, 10);
            // Arms slightly lower (swaying)
            g.fillStyle(0x1A1A1A);
            g.fillRect(2, 6, 3, 14);
            g.fillRect(19, 8, 3, 12);
            g.fillRect(1, 4, 4, 4);
            g.fillRect(19, 6, 4, 4);
        });

        // Fan 2: Fist pumping, blue shirt, taller
        SpriteFactory._tex(scene, 'fan-2-a', 24, 32, function(g) {
            g.fillStyle(0x1A1A1A);
            g.fillRect(4, 14, 16, 18);
            g.fillCircle(12, 11, 6);
            g.fillStyle(0x2A2A2A);
            g.fillCircle(12, 9, 6);
            g.fillStyle(0x2244AA, 0.4);
            g.fillRect(5, 16, 14, 12);
            // Right fist up
            g.fillStyle(0x1A1A1A);
            g.fillRect(18, 2, 3, 14);
            g.fillRect(17, 0, 5, 4);
            // Left arm down
            g.fillRect(3, 16, 3, 10);
        });
        SpriteFactory._tex(scene, 'fan-2-b', 24, 32, function(g) {
            g.fillStyle(0x1A1A1A);
            g.fillRect(4, 14, 16, 18);
            g.fillCircle(12, 11, 6);
            g.fillStyle(0x2A2A2A);
            g.fillCircle(12, 9, 6);
            g.fillStyle(0x2244AA, 0.4);
            g.fillRect(5, 16, 14, 12);
            // Right fist lower (pumping down)
            g.fillStyle(0x1A1A1A);
            g.fillRect(18, 6, 3, 12);
            g.fillRect(17, 4, 5, 4);
            g.fillRect(3, 16, 3, 10);
        });

        // Fan 3: Lighter held up, green shirt, shorter
        SpriteFactory._tex(scene, 'fan-3-a', 24, 32, function(g) {
            g.fillStyle(0x1A1A1A);
            g.fillRect(5, 18, 14, 14);
            g.fillCircle(12, 15, 5);
            g.fillStyle(0x252525);
            g.fillCircle(12, 13, 5);
            g.fillStyle(0x22AA33, 0.4);
            g.fillRect(6, 20, 12, 10);
            // Right arm up holding lighter
            g.fillStyle(0x1A1A1A);
            g.fillRect(16, 4, 3, 14);
            // Lighter
            g.fillStyle(0x888888);
            g.fillRect(16, 2, 3, 4);
            // Flame
            g.fillStyle(0xFFAA00, 0.9);
            g.fillRect(17, 0, 2, 3);
            g.fillStyle(0xFFFF00, 0.7);
            g.fillRect(17, 0, 1, 2);
            // Left arm at side
            g.fillStyle(0x1A1A1A);
            g.fillRect(5, 18, 3, 8);
        });
        SpriteFactory._tex(scene, 'fan-3-b', 24, 32, function(g) {
            g.fillStyle(0x1A1A1A);
            g.fillRect(5, 18, 14, 14);
            g.fillCircle(12, 15, 5);
            g.fillStyle(0x252525);
            g.fillCircle(12, 13, 5);
            g.fillStyle(0x22AA33, 0.4);
            g.fillRect(6, 20, 12, 10);
            // Lighter slightly swaying
            g.fillStyle(0x1A1A1A);
            g.fillRect(17, 5, 3, 13);
            g.fillStyle(0x888888);
            g.fillRect(17, 3, 3, 4);
            g.fillStyle(0xFFAA00, 0.9);
            g.fillRect(18, 1, 2, 3);
            g.fillStyle(0xFFFF00, 0.7);
            g.fillRect(18, 1, 1, 2);
            g.fillStyle(0x1A1A1A);
            g.fillRect(5, 18, 3, 8);
        });

        // Fan 4: Both arms up, purple shirt, medium height
        SpriteFactory._tex(scene, 'fan-4-a', 24, 32, function(g) {
            g.fillStyle(0x1A1A1A);
            g.fillRect(5, 16, 14, 16);
            g.fillCircle(12, 13, 5);
            // Long hair
            g.fillStyle(0x2A2A2A);
            g.fillCircle(12, 11, 6);
            g.fillRect(6, 11, 3, 8);
            g.fillRect(15, 11, 3, 8);
            g.fillStyle(0x7733AA, 0.4);
            g.fillRect(6, 18, 12, 10);
            // Both arms up in devil horns
            g.fillStyle(0x1A1A1A);
            g.fillRect(3, 4, 3, 14);
            g.fillRect(18, 4, 3, 14);
            // Devil horns gesture (index + pinky up)
            g.fillRect(2, 1, 2, 4);
            g.fillRect(5, 1, 2, 4);
            g.fillRect(17, 1, 2, 4);
            g.fillRect(20, 1, 2, 4);
        });
        SpriteFactory._tex(scene, 'fan-4-b', 24, 32, function(g) {
            g.fillStyle(0x1A1A1A);
            g.fillRect(5, 16, 14, 16);
            g.fillCircle(12, 13, 5);
            g.fillStyle(0x2A2A2A);
            g.fillCircle(12, 11, 6);
            g.fillRect(6, 11, 3, 8);
            g.fillRect(15, 11, 3, 8);
            g.fillStyle(0x7733AA, 0.4);
            g.fillRect(6, 18, 12, 10);
            // Arms swaying outward
            g.fillStyle(0x1A1A1A);
            g.fillRect(1, 5, 3, 14);
            g.fillRect(20, 6, 3, 13);
            g.fillRect(0, 3, 2, 4);
            g.fillRect(3, 3, 2, 4);
            g.fillRect(19, 4, 2, 4);
            g.fillRect(22, 4, 2, 4);
        });
    }

    /* ===================================================================
     *  ITEMS — 24x24  (UNCHANGED)
     * =================================================================*/

    static _createItemMoney(scene) {
        var P = SpriteFactory.PAL;
        SpriteFactory._tex(scene, 'item-money', 24, 24, function(g) {
            g.fillStyle(P.green);
            g.fillRect(2, 5, 20, 14);
            g.lineStyle(1, 0x228B22);
            g.strokeRect(2, 5, 20, 14);
            g.lineStyle(1, 0x228B22, 0.5);
            g.strokeRect(4, 7, 16, 10);
            g.lineStyle(2, P.yellow);
            g.lineBetween(14, 8, 10, 8);
            g.lineBetween(10, 8, 10, 11);
            g.lineBetween(10, 11, 14, 11);
            g.lineBetween(14, 11, 14, 15);
            g.lineBetween(14, 15, 10, 15);
            g.lineBetween(12, 7, 12, 17);
        });
    }

    static _createItemGoldRecord(scene) {
        var P = SpriteFactory.PAL;
        SpriteFactory._tex(scene, 'item-goldrecord', 24, 24, function(g) {
            g.fillStyle(P.gold);
            g.fillCircle(12, 12, 10);
            g.lineStyle(2, 0xDAA520);
            g.strokeCircle(12, 12, 10);
            g.fillStyle(P.darkGray);
            g.fillCircle(12, 12, 4);
            g.fillStyle(P.black);
            g.fillCircle(12, 12, 1);
            g.lineStyle(1, P.white, 0.3);
            g.lineBetween(12, 2, 12, 5);
            g.lineBetween(22, 12, 19, 12);
            g.lineBetween(12, 22, 12, 19);
            g.lineBetween(2, 12, 5, 12);
            g.lineBetween(5, 5, 7, 7);
            g.lineBetween(19, 5, 17, 7);
        });
    }

    static _createItemStar(scene) {
        var P = SpriteFactory.PAL;
        SpriteFactory._tex(scene, 'item-star', 24, 24, function(g) {
            var cx = 12, cy = 12;
            var outerR = 10, innerR = 4;
            var points = 5;

            g.fillStyle(P.yellow);
            g.beginPath();
            for (var i = 0; i < points * 2; i++) {
                var r = (i % 2 === 0) ? outerR : innerR;
                var angle = (Math.PI / 2 * 3) + (Math.PI / points) * i;
                var x = cx + Math.cos(angle) * r;
                var y = cy + Math.sin(angle) * r;
                if (i === 0) {
                    g.moveTo(x, y);
                } else {
                    g.lineTo(x, y);
                }
            }
            g.closePath();
            g.fillPath();

            g.lineStyle(1, 0xDAA520);
            g.beginPath();
            for (var i = 0; i < points * 2; i++) {
                var r = (i % 2 === 0) ? outerR : innerR;
                var angle = (Math.PI / 2 * 3) + (Math.PI / points) * i;
                var x = cx + Math.cos(angle) * r;
                var y = cy + Math.sin(angle) * r;
                if (i === 0) {
                    g.moveTo(x, y);
                } else {
                    g.lineTo(x, y);
                }
            }
            g.closePath();
            g.strokePath();

            g.fillStyle(P.white, 0.5);
            g.fillCircle(10, 8, 2);
        });
    }

    static _createItemNote(scene) {
        SpriteFactory._tex(scene, 'item-note', 24, 24, function(g) {
            g.fillStyle(0x7B2FBE);
            g.fillCircle(8, 18, 4);
            g.lineStyle(2, 0x7B2FBE);
            g.lineBetween(12, 18, 12, 4);
            g.fillStyle(0x7B2FBE);
            g.fillTriangle(12, 4, 18, 7, 12, 10);
        });
    }

    static _createItemBottle(scene) {
        var P = SpriteFactory.PAL;
        SpriteFactory._tex(scene, 'item-bottle', 24, 24, function(g) {
            g.fillStyle(P.brown);
            g.fillRect(7, 10, 10, 12);
            g.fillCircle(12, 21, 5);
            g.fillStyle(P.brown);
            g.fillRect(7, 16, 10, 6);
            g.fillStyle(P.brown);
            g.fillRect(10, 3, 4, 8);
            g.fillStyle(P.gold);
            g.fillRect(9, 2, 6, 3);
            g.fillStyle(0xF5F5DC);
            g.fillRect(8, 13, 8, 5);
            g.lineStyle(1, P.white, 0.5);
            g.lineBetween(9, 5, 11, 12);
        });
    }

    static _createItemSyringe(scene) {
        var P = SpriteFactory.PAL;
        SpriteFactory._tex(scene, 'item-syringe', 24, 24, function(g) {
            g.fillStyle(P.lightGray);
            g.fillRect(4, 10, 14, 5);
            g.lineStyle(1, P.gray, 0.5);
            g.lineBetween(7, 10, 7, 15);
            g.lineBetween(10, 10, 10, 15);
            g.lineBetween(13, 10, 13, 15);
            g.lineStyle(1, P.gray);
            g.lineBetween(18, 12, 23, 12);
            g.fillStyle(P.gray);
            g.fillTriangle(22, 11, 24, 12, 22, 14);
            g.fillStyle(P.red);
            g.fillRect(1, 10, 4, 5);
            g.fillStyle(P.darkGray);
            g.fillRect(0, 11, 2, 3);
            g.fillStyle(0x33FF33, 0.4);
            g.fillRect(5, 11, 12, 3);
        });
    }

    static _createItemGuitar(scene) {
        var P = SpriteFactory.PAL;
        SpriteFactory._tex(scene, 'item-guitar', 24, 24, function(g) {
            g.fillStyle(0xCC0000);
            g.fillCircle(10, 18, 6);
            g.fillCircle(10, 12, 5);
            g.fillStyle(0x330000);
            g.fillCircle(10, 16, 2);
            g.fillStyle(0x8B4513);
            g.fillRect(8, 2, 4, 11);
            g.fillStyle(0x222222);
            g.fillRect(7, 0, 6, 3);
            g.fillStyle(P.lightGray);
            g.fillRect(6, 0, 2, 2);
            g.fillRect(12, 0, 2, 2);
            g.lineStyle(1, P.lightGray, 0.5);
            g.lineBetween(9, 3, 9, 20);
            g.lineBetween(11, 3, 11, 20);
            g.fillStyle(0x111111);
            g.fillTriangle(6, 16, 10, 13, 10, 19);
        });
    }

    static _createItemVinyl(scene) {
        var P = SpriteFactory.PAL;
        SpriteFactory._tex(scene, 'item-vinyl', 24, 24, function(g) {
            g.fillStyle(P.black);
            g.fillCircle(12, 12, 10);
            g.lineStyle(1, 0x222222, 0.5);
            g.strokeCircle(12, 12, 8);
            g.strokeCircle(12, 12, 6);
            g.strokeCircle(12, 12, 4);
            g.fillStyle(P.red);
            g.fillCircle(12, 12, 3);
            g.fillStyle(P.white);
            g.fillCircle(12, 12, 1);
            g.lineStyle(1, P.white, 0.15);
            g.lineBetween(6, 6, 18, 18);
        });
    }

    /* ===================================================================
     *  WEAPONS  (UNCHANGED)
     * =================================================================*/

    static _createMicStand(scene) {
        var P = SpriteFactory.PAL;
        SpriteFactory._tex(scene, 'mic-stand', 48, 16, function(g) {
            g.lineStyle(2, P.gray);
            g.lineBetween(6, 8, 38, 8);
            g.fillStyle(P.darkGray);
            g.fillCircle(42, 8, 5);
            g.lineStyle(1, P.lightGray, 0.5);
            g.lineBetween(40, 5, 40, 11);
            g.lineBetween(42, 4, 42, 12);
            g.lineBetween(44, 5, 44, 11);
            g.fillStyle(P.darkGray);
            g.fillTriangle(2, 4, 10, 4, 6, 14);
        });
    }

    /* ===================================================================
     *  DARTBOARD & DARTS  (UNCHANGED)
     * =================================================================*/

    static _createDartboard(scene) {
        var P = SpriteFactory.PAL;
        SpriteFactory._tex(scene, 'dartboard', 128, 128, function(g) {
            var cx = 64, cy = 64;

            g.fillStyle(0x5C3A1E);
            g.fillRect(0, 0, 128, 128);

            g.fillStyle(P.black);
            g.fillCircle(cx, cy, 60);

            var ringColors = [0x228B22, 0xCC2222, P.white, 0x228B22, 0xCC2222, P.white, 0x228B22];
            var ringRadii  = [55, 48, 41, 34, 27, 20, 14];
            for (var i = 0; i < ringColors.length; i++) {
                g.fillStyle(ringColors[i]);
                g.fillCircle(cx, cy, ringRadii[i]);
            }

            g.lineStyle(1, P.black, 0.6);
            for (var i = 0; i < 20; i++) {
                var angle = (Math.PI * 2 / 20) * i;
                var x2 = cx + Math.cos(angle) * 58;
                var y2 = cy + Math.sin(angle) * 58;
                g.lineBetween(cx, cy, x2, y2);
            }

            g.fillStyle(P.skin);
            g.fillCircle(cx, cy, 12);

            g.lineStyle(2, P.black);
            g.lineBetween(cx - 7, cy - 5, cx - 2, cy - 3);
            g.lineBetween(cx + 7, cy - 5, cx + 2, cy - 3);

            g.fillStyle(P.black);
            g.fillCircle(cx - 4, cy - 1, 2);
            g.fillCircle(cx + 4, cy - 1, 2);

            g.lineStyle(2, P.black);
            g.lineBetween(cx - 5, cy + 3, cx - 1, cy + 5);
            g.lineBetween(cx + 5, cy + 3, cx + 1, cy + 5);

            g.fillStyle(P.brownHair);
            g.fillRect(cx - 8, cy - 12, 16, 5);
            g.fillTriangle(cx - 6, cy - 12, cx - 3, cy - 17, cx, cy - 12);
            g.fillTriangle(cx, cy - 12, cx + 3, cy - 17, cx + 6, cy - 12);

            g.lineStyle(1, P.black);
            g.lineBetween(cx - 3, cy + 7, cx + 3, cy + 7);

            g.lineStyle(3, 0x3E2723);
            g.strokeRect(1, 1, 126, 126);
        });
    }

    static _createDart(scene) {
        var P = SpriteFactory.PAL;
        SpriteFactory._tex(scene, 'dart', 16, 32, function(g) {
            var cx = 8;
            g.fillStyle(P.gray);
            g.fillTriangle(cx - 1, 0, cx + 1, 0, cx, 8);
            g.fillStyle(P.red);
            g.fillRect(cx - 1, 6, 3, 16);
            g.fillStyle(0xFF6666);
            g.fillTriangle(cx - 1, 22, cx - 6, 30, cx - 1, 28);
            g.fillTriangle(cx + 1, 22, cx + 6, 30, cx + 1, 28);
            g.fillStyle(P.red);
            g.fillRect(cx - 1, 22, 3, 8);
        });
    }

    static _createCrosshair(scene) {
        SpriteFactory._tex(scene, 'crosshair', 32, 32, function(g) {
            var cx = 16, cy = 16;
            g.lineStyle(2, 0xFF4400, 0.9);
            g.strokeCircle(cx, cy, 12);
            g.lineStyle(1, 0xFF4400, 0.9);
            g.lineBetween(cx, 1, cx, 10);
            g.lineBetween(cx, 22, cx, 31);
            g.lineBetween(1, cy, 10, cy);
            g.lineBetween(22, cy, 31, cy);
            g.fillStyle(0xFF4400, 0.8);
            g.fillCircle(cx, cy, 2);
        });
    }

    /* ===================================================================
     *  BACKGROUNDS — 480x270
     * =================================================================*/

    static _createBgStage(scene) {
        var P = SpriteFactory.PAL;
        SpriteFactory._tex(scene, 'bg-stage', 480, 270, function(g) {
            // Deep dark backdrop
            g.fillStyle(0x050008);
            g.fillRect(0, 0, 480, 270);

            // Stage backdrop — very dark purple
            g.fillStyle(0x0C0018);
            g.fillRect(0, 0, 480, 190);

            // Curtain folds
            g.lineStyle(1, 0x180030, 0.3);
            for (var x = 0; x < 480; x += 16) {
                g.lineBetween(x, 0, x, 190);
            }
            // Curtain gather at top
            for (var x = 0; x < 480; x += 32) {
                g.fillStyle(0x120020, 0.3);
                g.fillTriangle(x, 0, x + 16, 12, x + 32, 0);
            }

            // === METAL TRUSS / RIGGING at top ===
            // Horizontal truss bars
            g.fillStyle(0x555555);
            g.fillRect(0, 0, 480, 3);
            g.fillRect(0, 16, 480, 3);
            // Vertical truss segments
            for (var x = 0; x < 480; x += 24) {
                g.fillStyle(0x555555);
                g.fillRect(x, 0, 2, 19);
                // Cross bracing
                g.lineStyle(1, 0x444444, 0.6);
                g.lineBetween(x, 3, x + 24, 16);
                g.lineBetween(x + 24, 3, x, 16);
            }

            // === DRAMATIC SPOTLIGHTS ===
            // Magenta spotlight from left
            g.fillStyle(0xFF1493, 0.04);
            g.fillTriangle(60, 19, 140, 190, 20, 190);
            g.fillStyle(0xFF1493, 0.06);
            g.fillTriangle(65, 19, 120, 190, 40, 190);
            g.fillStyle(0xFF1493, 0.03);
            g.fillTriangle(55, 19, 150, 190, 10, 190);

            // Cyan spotlight from center-right
            g.fillStyle(0x00FFFF, 0.04);
            g.fillTriangle(300, 19, 370, 190, 230, 190);
            g.fillStyle(0x00FFFF, 0.06);
            g.fillTriangle(300, 19, 350, 190, 250, 190);
            g.fillStyle(0x00FFFF, 0.03);
            g.fillTriangle(305, 19, 380, 190, 220, 190);

            // White spotlight center
            g.fillStyle(0xFFFFFF, 0.03);
            g.fillTriangle(200, 19, 280, 190, 120, 190);
            g.fillStyle(0xFFFFFF, 0.05);
            g.fillTriangle(200, 19, 260, 190, 140, 190);

            // Magenta spotlight from right
            g.fillStyle(0xFF1493, 0.04);
            g.fillTriangle(420, 19, 470, 190, 370, 190);

            // Light fixture housings on truss
            var lightPositions = [60, 140, 200, 300, 380, 420];
            var lightColors = [0xFF1493, 0xFFFF00, 0xFFFFFF, 0x00FFFF, 0xFF4400, 0xFF1493];
            for (var i = 0; i < lightPositions.length; i++) {
                g.fillStyle(0x333333);
                g.fillRect(lightPositions[i] - 5, 16, 10, 6);
                g.fillStyle(lightColors[i], 0.8);
                g.fillRect(lightPositions[i] - 3, 19, 6, 3);
            }

            // === AMP STACKS — left side ===
            for (var row = 0; row < 3; row++) {
                var ay = 55 + row * 42;
                g.fillStyle(P.ampGray);
                g.fillRect(5, ay, 55, 40);
                g.lineStyle(1, 0x555555);
                g.strokeRect(5, ay, 55, 40);
                // Speaker cones (2x2 grid)
                for (var sx = 0; sx < 2; sx++) {
                    for (var sy = 0; sy < 2; sy++) {
                        var scx = 20 + sx * 24;
                        var scy = ay + 10 + sy * 18;
                        g.fillStyle(0x1A1A1A);
                        g.fillCircle(scx, scy, 7);
                        g.fillStyle(0x2A2A2A);
                        g.fillCircle(scx, scy, 4);
                        g.fillStyle(0x333333);
                        g.fillCircle(scx, scy, 2);
                    }
                }
                // Amp brand plate
                g.fillStyle(0x555555);
                g.fillRect(22, ay + 2, 20, 4);
            }

            // === AMP STACKS — right side ===
            for (var row = 0; row < 3; row++) {
                var ay = 55 + row * 42;
                g.fillStyle(P.ampGray);
                g.fillRect(420, ay, 55, 40);
                g.lineStyle(1, 0x555555);
                g.strokeRect(420, ay, 55, 40);
                for (var sx = 0; sx < 2; sx++) {
                    for (var sy = 0; sy < 2; sy++) {
                        var scx = 435 + sx * 24;
                        var scy = ay + 10 + sy * 18;
                        g.fillStyle(0x1A1A1A);
                        g.fillCircle(scx, scy, 7);
                        g.fillStyle(0x2A2A2A);
                        g.fillCircle(scx, scy, 4);
                        g.fillStyle(0x333333);
                        g.fillCircle(scx, scy, 2);
                    }
                }
                g.fillStyle(0x555555);
                g.fillRect(437, ay + 2, 20, 4);
            }

            // === FIRE / PYRO COLUMNS on sides ===
            // Left pyro
            var pyroLeftX = 68;
            g.fillStyle(0xFF4400, 0.15);
            g.fillRect(pyroLeftX - 8, 100, 16, 90);
            g.fillStyle(0xFF6600, 0.2);
            g.fillTriangle(pyroLeftX - 6, 190, pyroLeftX, 90, pyroLeftX + 6, 190);
            g.fillStyle(0xFFAA00, 0.25);
            g.fillTriangle(pyroLeftX - 4, 190, pyroLeftX, 110, pyroLeftX + 4, 190);
            g.fillStyle(0xFFDD00, 0.2);
            g.fillTriangle(pyroLeftX - 2, 190, pyroLeftX, 130, pyroLeftX + 2, 190);
            // Right pyro
            var pyroRightX = 412;
            g.fillStyle(0xFF4400, 0.15);
            g.fillRect(pyroRightX - 8, 100, 16, 90);
            g.fillStyle(0xFF6600, 0.2);
            g.fillTriangle(pyroRightX - 6, 190, pyroRightX, 90, pyroRightX + 6, 190);
            g.fillStyle(0xFFAA00, 0.25);
            g.fillTriangle(pyroRightX - 4, 190, pyroRightX, 110, pyroRightX + 4, 190);
            g.fillStyle(0xFFDD00, 0.2);
            g.fillTriangle(pyroRightX - 2, 190, pyroRightX, 130, pyroRightX + 2, 190);

            // === SMOKE / FOG at stage base ===
            g.fillStyle(0xAABBCC, 0.06);
            g.fillEllipse(120, 188, 120, 14);
            g.fillEllipse(240, 192, 160, 18);
            g.fillEllipse(360, 186, 100, 12);
            g.fillStyle(0x8899AA, 0.04);
            g.fillEllipse(180, 185, 80, 10);
            g.fillEllipse(300, 190, 100, 14);

            // === STAGE FLOOR (wood brown) ===
            g.fillStyle(P.stageFloor);
            g.fillRect(0, 190, 480, 80);
            // Floorboard lines
            g.lineStyle(1, 0x4A2E14, 0.5);
            for (var y = 195; y < 270; y += 10) {
                g.lineBetween(0, y, 480, y);
            }
            // Floorboard vertical joints (staggered)
            for (var x = 30; x < 480; x += 60) {
                var yOffset = (Math.floor(x / 60) % 2) * 5;
                g.lineBetween(x, 190 + yOffset, x, 195 + yOffset);
                g.lineBetween(x, 210 + yOffset, x, 215 + yOffset);
                g.lineBetween(x, 230 + yOffset, x, 235 + yOffset);
                g.lineBetween(x, 250 + yOffset, x, 255 + yOffset);
            }
            // Floor highlight from spotlights
            g.fillStyle(0xFF1493, 0.03);
            g.fillEllipse(80, 210, 80, 30);
            g.fillStyle(0x00FFFF, 0.03);
            g.fillEllipse(300, 210, 80, 30);
            g.fillStyle(0xFFFFFF, 0.02);
            g.fillEllipse(200, 210, 80, 30);

            // Stage edge / lip
            g.fillStyle(0x888888);
            g.fillRect(0, 188, 480, 4);
            g.fillStyle(0x666666);
            g.fillRect(0, 188, 480, 1);

            // Monitor wedges on stage
            g.fillStyle(0x2A2A2A);
            g.fillTriangle(100, 210, 135, 210, 117, 198);
            g.fillTriangle(345, 210, 380, 210, 362, 198);
            g.fillStyle(0x333333);
            g.fillRect(103, 205, 29, 5);
            g.fillRect(348, 205, 29, 5);

            // Neon strip along back wall
            g.fillStyle(P.neonPink, 0.35);
            g.fillRect(65, 178, 350, 2);
            g.fillStyle(P.neonBlue, 0.25);
            g.fillRect(65, 176, 350, 2);
            // Glow
            g.fillStyle(P.neonPink, 0.05);
            g.fillRect(60, 172, 360, 12);
        });
    }

    static _createBgBar(scene) {
        var P = SpriteFactory.PAL;
        SpriteFactory._tex(scene, 'bg-bar', 480, 270, function(g) {
            g.fillStyle(0x1A120A);
            g.fillRect(0, 0, 480, 270);

            g.fillStyle(0x2A1A0E);
            g.fillRect(0, 0, 480, 180);

            g.lineStyle(1, 0x3D2B1F, 0.5);
            for (var y = 0; y < 180; y += 15) {
                g.lineBetween(0, y, 480, y);
            }
            g.lineStyle(1, 0x1A0E06, 0.4);
            for (var x = 0; x < 480; x += 80) {
                g.lineBetween(x, 0, x, 180);
            }

            g.fillStyle(0x3D2B1F);
            g.fillRect(0, 100, 480, 4);

            g.fillStyle(0x1E140C);
            g.fillRect(0, 104, 480, 76);
            g.lineStyle(1, 0x2A1A0E, 0.3);
            for (var y = 104; y < 180; y += 12) {
                g.lineBetween(0, y, 480, y);
            }

            var posterColors = [0xCC3333, 0x3333CC, 0x33CC33, 0xCCCC33, 0xCC33CC];
            for (var i = 0; i < 5; i++) {
                var px = 40 + i * 90;
                g.fillStyle(posterColors[i], 0.7);
                g.fillRect(px, 20 + (i % 2) * 15, 24, 32);
                g.lineStyle(1, 0x000000, 0.5);
                g.strokeRect(px, 20 + (i % 2) * 15, 24, 32);
            }

            g.fillStyle(0x4A3520);
            g.fillRect(10, 68, 200, 4);
            g.fillRect(10, 92, 200, 4);
            var bottleColors = [0x33AA33, 0xAA3333, 0x8B4513, 0xDAA520, 0x4444AA, 0x33AA33, 0xAA3333, 0x8B4513];
            for (var i = 0; i < 8; i++) {
                var bx = 18 + i * 24;
                g.fillStyle(bottleColors[i], 0.8);
                g.fillRect(bx, 74, 6, 16);
                g.fillRect(bx + 1, 70, 4, 6);
                g.lineStyle(1, P.white, 0.2);
                g.lineBetween(bx + 1, 72, bx + 1, 88);
            }
            for (var i = 0; i < 6; i++) {
                var bx = 22 + i * 30;
                g.fillStyle(bottleColors[(i + 3) % bottleColors.length], 0.7);
                g.fillRect(bx, 50, 6, 16);
                g.fillRect(bx + 1, 46, 4, 6);
            }

            g.fillStyle(0x3D2B1F);
            g.fillRect(0, 170, 480, 14);
            g.fillStyle(0x4A3520);
            g.fillRect(0, 170, 480, 3);
            g.fillStyle(0x2A1808);
            g.fillRect(0, 184, 480, 30);
            g.lineStyle(1, 0x3D2B1F, 0.3);
            for (var x = 30; x < 480; x += 60) {
                g.strokeRect(x - 20, 186, 40, 26);
            }

            g.fillStyle(0x1A100A);
            g.fillRect(0, 214, 480, 56);
            g.lineStyle(1, 0x2A1A0E, 0.3);
            for (var y = 214; y < 270; y += 14) {
                g.lineBetween(0, y, 480, y);
            }
            for (var x = 0; x < 480; x += 20) {
                g.lineBetween(x, 214, x, 270);
            }

            for (var i = 0; i < 4; i++) {
                var stoolX = 80 + i * 100;
                g.fillStyle(0x555555);
                g.fillRect(stoolX, 210, 3, 20);
                g.fillRect(stoolX - 6, 228, 15, 3);
                g.fillStyle(P.red, 0.7);
                g.fillRect(stoolX - 5, 205, 13, 6);
            }

            g.fillStyle(0x555555);
            g.fillRect(380, 15, 60, 45);
            g.fillStyle(0x1A2A3A);
            g.fillRect(383, 18, 54, 39);
            for (var i = 0; i < 40; i++) {
                var tx = 385 + (i * 13) % 50;
                var ty = 20 + (i * 7) % 35;
                g.fillStyle(0x4488AA, 0.3);
                g.fillRect(tx, ty, 2, 1);
            }

            g.lineStyle(2, P.neonPink, 0.5);
            g.strokeRect(280, 25, 50, 20);
            g.fillStyle(P.neonPink, 0.15);
            g.fillRect(280, 25, 50, 20);

            g.fillStyle(0x000000, 0.15);
            g.fillRect(0, 0, 60, 270);
            g.fillRect(420, 0, 60, 270);
            g.fillStyle(0x332200, 0.08);
            g.fillRect(0, 0, 480, 270);

            for (var i = 0; i < 3; i++) {
                var hx = 120 + i * 120;
                g.lineStyle(1, 0x444444);
                g.lineBetween(hx, 0, hx, 8);
                g.fillStyle(0xFFAA33, 0.6);
                g.fillCircle(hx, 12, 5);
                g.fillStyle(0xFFAA33, 0.05);
                g.fillCircle(hx, 12, 30);
            }
        });
    }

    static _createBgAlley(scene) {
        var P = SpriteFactory.PAL;
        SpriteFactory._tex(scene, 'bg-alley', 480, 270, function(g) {
            // Very dark base
            g.fillStyle(0x080A0E);
            g.fillRect(0, 0, 480, 270);

            // Sky (dark overcast with subtle gradient)
            g.fillStyle(0x101520);
            g.fillRect(0, 0, 480, 50);
            g.fillStyle(0x0C1018);
            g.fillRect(0, 30, 480, 20);

            // === LEFT BUILDING WALL ===
            g.fillStyle(0x1A1210);
            g.fillRect(0, 15, 145, 255);
            // Brick pattern — detailed
            for (var by = 17; by < 270; by += 8) {
                var offset = (Math.floor(by / 8) % 2) * 10;
                for (var bx = offset; bx < 145; bx += 20) {
                    var brickVar = ((bx + by) * 7) % 0x080606;
                    g.fillStyle(0x3A2218 + brickVar);
                    g.fillRect(bx, by, 18, 6);
                    // Mortar lines
                    g.lineStyle(1, 0x0E0A08, 0.5);
                    g.strokeRect(bx, by, 18, 6);
                }
            }

            // === RIGHT BUILDING WALL ===
            g.fillStyle(0x1A1210);
            g.fillRect(335, 15, 145, 255);
            for (var by = 17; by < 270; by += 8) {
                var offset = (Math.floor(by / 8) % 2) * 10;
                for (var bx = 335 + offset; bx < 480; bx += 20) {
                    var brickVar = ((bx + by) * 7) % 0x080606;
                    g.fillStyle(0x3A2218 + brickVar);
                    g.fillRect(bx, by, 18, 6);
                    g.lineStyle(1, 0x0E0A08, 0.5);
                    g.strokeRect(bx, by, 18, 6);
                }
            }

            // === BACK WALL ===
            g.fillStyle(0x121518);
            g.fillRect(145, 15, 190, 140);
            for (var by = 17; by < 155; by += 8) {
                var offset = (Math.floor(by / 8) % 2) * 10;
                for (var bx = 147 + offset; bx < 333; bx += 20) {
                    g.fillStyle(0x2A1A14);
                    g.fillRect(bx, by, 18, 6);
                }
            }

            // === FIRE ESCAPE on left wall ===
            g.fillStyle(0x383838);
            // Platforms
            g.fillRect(85, 35, 50, 3);
            g.fillRect(85, 75, 50, 3);
            g.fillRect(85, 115, 50, 3);
            // Railings
            g.lineStyle(1, 0x444444);
            g.lineBetween(85, 35, 85, 30);
            g.lineBetween(135, 35, 135, 30);
            g.lineBetween(85, 75, 85, 70);
            g.lineBetween(135, 75, 135, 70);
            g.lineBetween(85, 115, 85, 110);
            g.lineBetween(135, 115, 135, 110);
            // Ladders between platforms
            g.lineStyle(1, 0x4A4A4A);
            g.lineBetween(100, 38, 100, 75);
            g.lineBetween(120, 38, 120, 75);
            g.lineBetween(100, 78, 100, 115);
            g.lineBetween(120, 78, 120, 115);
            // Ladder drop to ground
            g.lineBetween(100, 118, 100, 155);
            g.lineBetween(120, 118, 120, 155);
            // Rungs
            for (var ry = 44; ry < 155; ry += 8) {
                g.lineBetween(100, ry, 120, ry);
            }
            // Platform floor grating
            g.lineStyle(1, 0x333333, 0.4);
            for (var rx = 88; rx < 135; rx += 4) {
                g.lineBetween(rx, 35, rx, 38);
                g.lineBetween(rx, 75, rx, 78);
                g.lineBetween(rx, 115, rx, 118);
            }

            // === DUMPSTER ===
            g.fillStyle(0x2A4A2A);
            g.fillRect(15, 155, 65, 40);
            g.lineStyle(1, 0x1A3A1A);
            g.strokeRect(15, 155, 65, 40);
            // Dumpster lid (slightly open)
            g.fillStyle(0x2E5030);
            g.fillRect(13, 151, 69, 6);
            g.fillStyle(0x3A5A3A);
            g.fillRect(13, 148, 40, 5);
            // Handle
            g.fillStyle(0x555555);
            g.fillRect(42, 167, 10, 3);
            // Dumpster ribbing
            g.lineStyle(1, 0x1E3E1E, 0.5);
            g.lineBetween(30, 155, 30, 195);
            g.lineBetween(50, 155, 50, 195);
            g.lineBetween(65, 155, 65, 195);
            // Garbage spilling
            g.fillStyle(0x5A5A3A, 0.5);
            g.fillRect(17, 148, 8, 5);
            g.fillStyle(0x4A4A2A, 0.4);
            g.fillRect(22, 146, 6, 4);

            // === BROKEN NEON SIGN on right wall ===
            // Sign bracket
            g.fillStyle(0x444444);
            g.fillRect(355, 42, 4, 8);
            g.fillRect(430, 42, 4, 8);
            // Sign background (dark)
            g.fillStyle(0x111111);
            g.fillRect(355, 48, 80, 25);
            g.lineStyle(1, 0x333333);
            g.strokeRect(355, 48, 80, 25);
            // Working neon letters (partial)
            g.lineStyle(2, P.neonPink, 0.5);
            // "B" shape
            g.lineBetween(362, 53, 362, 68);
            g.lineBetween(362, 53, 372, 53);
            g.lineBetween(372, 53, 372, 58);
            g.lineBetween(362, 60, 372, 60);
            g.lineBetween(372, 60, 372, 68);
            g.lineBetween(362, 68, 372, 68);
            // Broken middle section (gap / dark)
            g.fillStyle(0x111111);
            g.fillRect(378, 48, 22, 25);
            // Dangling wire
            g.lineStyle(1, 0x444444, 0.4);
            g.lineBetween(385, 60, 388, 68);
            g.lineBetween(393, 55, 390, 65);
            // "R" at end (flickering)
            g.lineStyle(2, P.neonPink, 0.3);
            g.lineBetween(408, 53, 408, 68);
            g.lineBetween(408, 53, 418, 53);
            g.lineBetween(418, 53, 418, 60);
            g.lineBetween(408, 60, 418, 60);
            g.lineBetween(413, 60, 418, 68);
            // Neon glow (faint)
            g.fillStyle(P.neonPink, 0.04);
            g.fillRect(350, 43, 90, 35);

            // === GRAFFITI on right wall ===
            // Spray paint blob
            g.fillStyle(0xFF3333, 0.25);
            g.fillCircle(380, 105, 10);
            g.fillStyle(0xFF3333, 0.15);
            g.fillCircle(385, 100, 6);
            // Drips
            g.fillStyle(0xFF3333, 0.2);
            g.fillRect(376, 110, 2, 8);
            g.fillRect(383, 112, 2, 6);
            // Tag lettering
            g.lineStyle(2, 0x33FF33, 0.2);
            g.lineBetween(355, 125, 365, 118);
            g.lineBetween(365, 118, 375, 128);
            g.lineBetween(375, 128, 385, 115);
            g.lineBetween(385, 115, 395, 130);
            // Yellow scrawl
            g.lineStyle(2, 0xFFFF33, 0.25);
            g.lineBetween(400, 100, 420, 95);
            g.lineBetween(420, 95, 430, 105);

            // === WET ASPHALT GROUND ===
            g.fillStyle(0x141820);
            g.fillRect(0, 190, 480, 80);
            // Ground cracks
            g.lineStyle(1, 0x1E2228, 0.4);
            g.lineBetween(100, 200, 180, 240);
            g.lineBetween(180, 240, 260, 225);
            g.lineBetween(260, 225, 280, 250);
            g.lineBetween(350, 210, 310, 245);
            g.lineBetween(310, 245, 300, 260);

            // === RAIN PUDDLES ===
            for (var i = 0; i < 7; i++) {
                var px = 150 + i * 35 + (i * 17) % 20;
                var py = 210 + (i * 13) % 30;
                var pw = 22 + (i % 3) * 10;
                var ph = 4 + (i % 2) * 2;
                g.fillStyle(0x1A2535, 0.5);
                g.fillEllipse(px, py, pw, ph);
                // Reflection
                g.fillStyle(0x334466, 0.15);
                g.fillEllipse(px, py - 1, pw * 0.7, ph * 0.6);
                // Pink neon reflection in some puddles
                if (i % 3 === 0) {
                    g.fillStyle(0xFF1493, 0.06);
                    g.fillEllipse(px, py, pw * 0.5, ph * 0.4);
                }
            }

            // === STEAM FROM GRATE ===
            // Grate on ground
            g.fillStyle(0x333333);
            g.fillRect(230, 215, 30, 4);
            g.lineStyle(1, 0x222222);
            for (var gx = 233; gx < 258; gx += 5) {
                g.lineBetween(gx, 215, gx, 219);
            }
            // Steam wisps
            g.fillStyle(0x667788, 0.07);
            g.fillEllipse(245, 205, 50, 16);
            g.fillEllipse(250, 195, 36, 12);
            g.fillEllipse(242, 185, 24, 10);
            g.fillEllipse(248, 177, 16, 8);

            // === NEWSPAPER on ground ===
            g.fillStyle(0xBBBBAA, 0.3);
            g.fillRect(300, 230, 14, 8);
            g.fillRect(302, 238, 12, 6);
            g.lineStyle(1, 0x888877, 0.2);
            g.lineBetween(302, 233, 312, 233);
            g.lineBetween(302, 235, 310, 235);

            // === DARK OPPRESSIVE OVERLAY ===
            g.fillStyle(0x000000, 0.15);
            g.fillRect(0, 0, 480, 270);

            // === VIGNETTE ===
            g.fillStyle(0x000000, 0.35);
            g.fillRect(0, 0, 25, 270);
            g.fillRect(455, 0, 25, 270);
            g.fillStyle(0x000000, 0.2);
            g.fillRect(0, 0, 480, 12);
            g.fillRect(0, 260, 480, 10);
        });
    }

    /* ===================================================================
     *  PARTICLES  (UNCHANGED)
     * =================================================================*/

    static _createParticleRain(scene) {
        SpriteFactory._tex(scene, 'particle-rain', 2, 8, function(g) {
            g.fillStyle(0xAABBDD, 0.4);
            g.fillRect(0, 0, 2, 2);
            g.fillStyle(0xCCDDFF, 0.7);
            g.fillRect(0, 2, 2, 4);
            g.fillStyle(0xAABBDD, 0.3);
            g.fillRect(0, 6, 2, 2);
        });
    }

    static _createParticleSpark(scene) {
        SpriteFactory._tex(scene, 'particle-spark', 4, 4, function(g) {
            g.fillStyle(0xFFFF00);
            g.fillRect(0, 0, 4, 4);
            g.fillStyle(0xFFFFFF, 0.7);
            g.fillRect(1, 1, 2, 2);
        });
    }

    /* ===================================================================
     *  HUD  (UNCHANGED)
     * =================================================================*/

    static _createHealthBarFrame(scene) {
        var P = SpriteFactory.PAL;
        SpriteFactory._tex(scene, 'healthbar-frame', 100, 16, function(g) {
            g.fillStyle(P.darkGray);
            g.fillRect(0, 0, 100, 16);
            g.fillStyle(0x1A1A1A);
            g.fillRect(2, 2, 96, 12);
            g.lineStyle(1, 0x666666, 0.5);
            g.lineBetween(1, 1, 99, 1);
            g.lineStyle(1, 0x222222, 0.8);
            g.lineBetween(1, 15, 99, 15);
        });
    }

    static _createHealthBarFill(scene) {
        SpriteFactory._tex(scene, 'healthbar-fill', 96, 12, function(g) {
            g.fillStyle(0x00CC00);
            g.fillRect(0, 0, 96, 12);
            g.fillStyle(0x00FF00, 0.4);
            g.fillRect(0, 1, 96, 4);
            g.fillStyle(0x008800, 0.5);
            g.fillRect(0, 9, 96, 3);
        });
    }

    /* ===================================================================
     *  VIRTUAL BUTTONS (semi-transparent, for mobile)  (UNCHANGED)
     * =================================================================*/

    static _createBtnLeft(scene) {
        SpriteFactory._tex(scene, 'btn-left', 48, 48, function(g) {
            var cx = 24, cy = 24;
            g.fillStyle(0x000000, 0.4);
            g.fillCircle(cx, cy, 22);
            g.lineStyle(2, 0xFFFFFF, 0.3);
            g.strokeCircle(cx, cy, 22);
            g.fillStyle(0xFFFFFF, 0.7);
            g.fillTriangle(14, cy, 30, cy - 10, 30, cy + 10);
        });
    }

    static _createBtnRight(scene) {
        SpriteFactory._tex(scene, 'btn-right', 48, 48, function(g) {
            var cx = 24, cy = 24;
            g.fillStyle(0x000000, 0.4);
            g.fillCircle(cx, cy, 22);
            g.lineStyle(2, 0xFFFFFF, 0.3);
            g.strokeCircle(cx, cy, 22);
            g.fillStyle(0xFFFFFF, 0.7);
            g.fillTriangle(34, cy, 18, cy - 10, 18, cy + 10);
        });
    }

    static _createBtnAttack(scene) {
        SpriteFactory._tex(scene, 'btn-attack', 56, 56, function(g) {
            var cx = 28, cy = 28;
            g.fillStyle(0x000000, 0.4);
            g.fillCircle(cx, cy, 26);
            g.lineStyle(2, 0xFF4444, 0.4);
            g.strokeCircle(cx, cy, 26);
            g.lineStyle(3, 0xFF4444, 0.8);
            g.lineBetween(cx - 8, cy + 10, cx, cy - 10);
            g.lineBetween(cx + 8, cy + 10, cx, cy - 10);
            g.lineBetween(cx - 5, cy + 2, cx + 5, cy + 2);
        });
    }

    static _createBtnSpecial(scene) {
        SpriteFactory._tex(scene, 'btn-special', 48, 48, function(g) {
            var cx = 24, cy = 24;
            g.fillStyle(0x000000, 0.4);
            g.fillCircle(cx, cy, 22);
            g.lineStyle(2, 0x44AAFF, 0.4);
            g.strokeCircle(cx, cy, 22);
            g.lineStyle(3, 0x44AAFF, 0.8);
            g.lineBetween(cx + 6, cy - 8, cx - 4, cy - 8);
            g.lineBetween(cx - 4, cy - 8, cx - 4, cy);
            g.lineBetween(cx - 4, cy, cx + 4, cy);
            g.lineBetween(cx + 4, cy, cx + 4, cy + 8);
            g.lineBetween(cx + 4, cy + 8, cx - 6, cy + 8);
        });
    }
}
