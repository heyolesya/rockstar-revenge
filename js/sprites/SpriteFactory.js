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
            skin:        0xF5C5A3,
            skinDark:    0xD4A373,
            blondeHair:  0xFFD700,
            blondeLight: 0xFFF44F,
            brownHair:   0x5C3A1E,

            // Rockstar outfit
            purple:      0x9B30FF,
            purpleDark:  0x6A0DAD,
            black:       0x111111,
            spandex:     0x1A1A2E,
            boot:        0x2A2A2A,

            // Grunge outfit
            flannel1:    0xCC2222,
            flannel2:    0x222222,
            denim:       0x3B5998,
            denimLight:  0x5A7FBA,
            combatBoot:  0x3E2723,

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
        const g = scene.add.graphics();
        drawFn(g, w, h);
        g.generateTexture(key, w, h);
        g.destroy();
    }

    /* ===================================================================
     *  ROCKSTAR — 64x64
     * =================================================================*/

    /** Draw the base rockstar body (reused across frames).
     *  legOffsets: pixel offsets for left/right boot x-positions.
     *  armAngle: null | 'side' | '45' | 'forward'
     */
    static _drawRockstarBase(g, w, h, opts) {
        opts = opts || {};
        var P = SpriteFactory.PAL;
        var cx = w / 2;            // 32
        var legOff = opts.legOff || { lx: 0, rx: 0 };
        var armAngle = opts.armAngle || null;

        // --- Boots (bottom-up) ---
        // Left boot
        g.fillStyle(P.boot);
        g.fillRect(cx - 12 + legOff.lx, 54, 10, 8);
        // Boot point
        g.fillTriangle(cx - 14 + legOff.lx, 62, cx - 12 + legOff.lx, 54, cx - 12 + legOff.lx, 62);
        // Right boot
        g.fillRect(cx + 2 + legOff.rx, 54, 10, 8);
        g.fillTriangle(cx + 14 + legOff.rx, 62, cx + 12 + legOff.rx, 54, cx + 12 + legOff.rx, 62);

        // --- Legs (black spandex) ---
        g.fillStyle(P.spandex);
        // Left leg
        g.fillRect(cx - 10 + legOff.lx, 38, 9, 18);
        // Right leg
        g.fillRect(cx + 1 + legOff.rx, 38, 9, 18);

        // --- Torso (bare chest + vest) ---
        // Vest sides (purple)
        g.fillStyle(P.purple);
        g.fillRect(cx - 14, 20, 28, 20);

        // Bare chest center (skin)
        g.fillStyle(P.skin);
        g.fillRect(cx - 6, 21, 12, 18);

        // Chest hair (small dark marks)
        g.lineStyle(1, P.brownHair, 0.6);
        g.lineBetween(cx - 3, 25, cx - 1, 28);
        g.lineBetween(cx + 1, 24, cx + 3, 27);
        g.lineBetween(cx - 2, 29, cx, 32);
        g.lineBetween(cx + 1, 30, cx + 2, 33);

        // Vest lapel outlines
        g.lineStyle(1, P.purpleDark);
        g.lineBetween(cx - 6, 21, cx - 6, 39);
        g.lineBetween(cx + 6, 21, cx + 6, 39);

        // Belt
        g.fillStyle(P.darkGray);
        g.fillRect(cx - 12, 37, 24, 3);
        // Belt buckle
        g.fillStyle(P.gold);
        g.fillRect(cx - 3, 37, 6, 3);

        // --- Arms ---
        if (!armAngle) {
            // Resting arms
            g.fillStyle(P.skin);
            // Left arm
            g.fillRect(cx - 18, 22, 5, 16);
            // Right arm
            g.fillRect(cx + 13, 22, 5, 16);
        } else {
            SpriteFactory._drawRockstarArm(g, cx, armAngle);
        }

        // --- Head ---
        g.fillStyle(P.skin);
        g.fillCircle(cx, 14, 9);

        // Eyes
        g.fillStyle(P.black);
        g.fillRect(cx - 5, 12, 3, 3);
        g.fillRect(cx + 2, 12, 3, 3);
        // Eye whites
        g.fillStyle(P.white);
        g.fillRect(cx - 4, 12, 1, 2);
        g.fillRect(cx + 3, 12, 1, 2);

        // Mouth (confident smirk)
        g.lineStyle(1, P.brownHair);
        g.lineBetween(cx - 3, 18, cx + 3, 17);

        // --- BIG TEASED HAIR (glam metal mane) ---
        SpriteFactory._drawBigHair(g, cx);
    }

    static _drawBigHair(g, cx) {
        var P = SpriteFactory.PAL;
        // Main hair mass — big rounded shape
        g.fillStyle(P.blondeHair);
        // Central dome
        g.fillCircle(cx, 5, 14);
        // Left poof
        g.fillCircle(cx - 10, 8, 10);
        // Right poof
        g.fillCircle(cx + 10, 8, 10);

        // Radiating spiky triangles for teased look
        g.fillStyle(P.blondeLight);
        // Top spikes
        g.fillTriangle(cx - 4, 0, cx, -8, cx + 4, 0);
        g.fillTriangle(cx - 10, 1, cx - 7, -6, cx - 3, 1);
        g.fillTriangle(cx + 3, 1, cx + 7, -6, cx + 10, 1);
        // Side spikes left
        g.fillTriangle(cx - 16, 4, cx - 22, 0, cx - 16, 10);
        g.fillTriangle(cx - 18, 10, cx - 24, 8, cx - 18, 16);
        // Side spikes right
        g.fillTriangle(cx + 16, 4, cx + 22, 0, cx + 16, 10);
        g.fillTriangle(cx + 18, 10, cx + 24, 8, cx + 18, 16);

        // Hair flowing down sides
        g.fillStyle(P.blondeHair);
        g.fillRect(cx - 20, 8, 6, 14);
        g.fillRect(cx + 14, 8, 6, 14);

        // Highlight streaks
        g.lineStyle(1, P.white, 0.3);
        g.lineBetween(cx - 6, -2, cx - 4, 6);
        g.lineBetween(cx + 4, -1, cx + 6, 7);
    }

    static _drawRockstarArm(g, cx, angle) {
        var P = SpriteFactory.PAL;
        // Left arm always resting
        g.fillStyle(P.skin);
        g.fillRect(cx - 18, 22, 5, 16);

        // Right arm at different angles — holding mic stand
        if (angle === 'side') {
            g.fillStyle(P.skin);
            g.fillRect(cx + 13, 22, 5, 16);
            // Mic stand at side
            g.lineStyle(2, P.gray);
            g.lineBetween(cx + 18, 30, cx + 24, 30);
        } else if (angle === '45') {
            g.fillStyle(P.skin);
            // Arm going out at 45 deg
            g.fillRect(cx + 13, 20, 5, 6);
            g.fillRect(cx + 16, 18, 8, 5);
            g.fillRect(cx + 22, 16, 6, 5);
            // Mic stand
            g.lineStyle(2, P.gray);
            g.lineBetween(cx + 26, 18, cx + 36, 12);
            g.fillStyle(P.darkGray);
            g.fillCircle(cx + 38, 11, 3);
        } else if (angle === 'forward') {
            g.fillStyle(P.skin);
            // Arm fully extended
            g.fillRect(cx + 13, 20, 5, 5);
            g.fillRect(cx + 16, 18, 14, 5);
            g.fillRect(cx + 28, 18, 6, 5);
            // Mic stand extended
            g.lineStyle(2, P.gray);
            g.lineBetween(cx + 32, 20, cx + 42, 20);
            g.fillStyle(P.darkGray);
            g.fillCircle(cx + 44, 20, 3);
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

            // --- Boots (normal shoes) ---
            g.fillStyle(P.darkGray);
            g.fillRect(cx - 11, 55, 9, 7);
            g.fillRect(cx + 2, 55, 9, 7);

            // --- Legs (blue jeans) ---
            g.fillStyle(P.denim);
            g.fillRect(cx - 10, 38, 9, 18);
            g.fillRect(cx + 1, 38, 9, 18);
            // Jean seams
            g.lineStyle(1, P.denimLight, 0.4);
            g.lineBetween(cx - 6, 38, cx - 6, 56);
            g.lineBetween(cx + 5, 38, cx + 5, 56);

            // --- Torso (white t-shirt) ---
            g.fillStyle(P.white);
            g.fillRect(cx - 14, 20, 28, 20);
            // T-shirt neckline
            g.lineStyle(1, P.lightGray);
            g.lineBetween(cx - 6, 20, cx + 6, 20);
            // Sleeve cuffs
            g.lineStyle(1, P.lightGray);
            g.lineBetween(cx - 14, 22, cx - 14, 28);
            g.lineBetween(cx + 14, 22, cx + 14, 28);

            // Belt
            g.fillStyle(P.brown);
            g.fillRect(cx - 12, 37, 24, 3);

            // --- Arms (skin) ---
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

            // --- Short hair (small brown semicircle) ---
            g.fillStyle(P.brownHair);
            g.fillCircle(cx, 8, 10);
            // Crop it — cover bottom of hair circle with skin
            g.fillStyle(P.skin);
            g.fillRect(cx - 11, 11, 22, 10);
            // Re-draw head over crop
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
     *  GRUNGE ENEMY — 48x48
     * =================================================================*/

    static _drawGrungeBase(g, w, h, opts) {
        opts = opts || {};
        var P = SpriteFactory.PAL;
        var cx = w / 2;  // 24
        var legOff = opts.legOff || { lx: 0, rx: 0 };
        var attacking = opts.attacking || false;
        var hurt = opts.hurt || false;
        var bodyTilt = hurt ? 4 : 0;

        // --- Combat boots ---
        g.fillStyle(P.combatBoot);
        g.fillRect(cx - 10 + legOff.lx + bodyTilt, 40, 8, 6);
        g.fillRect(cx + 2 + legOff.rx + bodyTilt, 40, 8, 6);
        // Boot soles
        g.fillStyle(P.black);
        g.fillRect(cx - 10 + legOff.lx + bodyTilt, 45, 8, 2);
        g.fillRect(cx + 2 + legOff.rx + bodyTilt, 45, 8, 2);

        // --- Ripped jeans ---
        g.fillStyle(P.denim);
        g.fillRect(cx - 8 + legOff.lx + bodyTilt, 28, 7, 14);
        g.fillRect(cx + 1 + legOff.rx + bodyTilt, 28, 7, 14);
        // Rips (skin showing through)
        g.fillStyle(P.skin, 0.7);
        g.fillRect(cx - 6 + legOff.lx + bodyTilt, 34, 4, 2);
        g.fillRect(cx + 3 + legOff.rx + bodyTilt, 36, 3, 2);

        // --- Flannel shirt (checkerboard pattern) ---
        var shirtX = cx - 11 + bodyTilt;
        var shirtY = 14;
        var shirtW = 22;
        var shirtH = 16;
        // Base
        g.fillStyle(P.flannel1);
        g.fillRect(shirtX, shirtY, shirtW, shirtH);
        // Checkerboard squares
        for (var row = 0; row < 4; row++) {
            for (var col = 0; col < 5; col++) {
                if ((row + col) % 2 === 0) {
                    g.fillStyle(P.flannel2);
                    g.fillRect(shirtX + col * 4 + 1, shirtY + row * 4, 4, 4);
                }
            }
        }

        // --- Arms ---
        g.fillStyle(P.flannel1);
        if (attacking) {
            // Left arm resting
            g.fillRect(cx - 14 + bodyTilt, 16, 4, 12);
            // Right arm extended (punch)
            g.fillRect(cx + 11 + bodyTilt, 14, 4, 5);
            g.fillRect(cx + 14 + bodyTilt, 13, 8, 5);
            // Fist
            g.fillStyle(P.skin);
            g.fillRect(cx + 20 + bodyTilt, 13, 5, 5);
        } else {
            g.fillRect(cx - 14 + bodyTilt, 16, 4, 12);
            g.fillRect(cx + 11 + bodyTilt, 16, 4, 12);
        }

        // --- Head ---
        g.fillStyle(P.skin);
        g.fillCircle(cx + bodyTilt, 9, 7);

        // Eyes
        g.fillStyle(P.black);
        g.fillRect(cx - 4 + bodyTilt, 7, 2, 3);
        g.fillRect(cx + 2 + bodyTilt, 7, 2, 3);

        // Frowning mouth
        g.lineStyle(1, P.black);
        g.lineBetween(cx - 2 + bodyTilt, 13, cx + 2 + bodyTilt, 14);

        // Stubble dots
        g.fillStyle(P.brownHair, 0.4);
        g.fillRect(cx - 3 + bodyTilt, 11, 1, 1);
        g.fillRect(cx + 1 + bodyTilt, 12, 1, 1);
        g.fillRect(cx - 1 + bodyTilt, 12, 1, 1);

        // --- Messy hair (shoulder-length, droopy) ---
        g.fillStyle(0xC4A852); // dirty blonde
        // Hair top
        g.fillCircle(cx + bodyTilt, 4, 8);
        // Droopy strands — left
        g.fillRect(cx - 8 + bodyTilt, 3, 4, 14);
        g.fillRect(cx - 9 + bodyTilt, 6, 3, 10);
        // Droopy strands — right
        g.fillRect(cx + 4 + bodyTilt, 3, 4, 14);
        g.fillRect(cx + 6 + bodyTilt, 6, 3, 10);
        // Some messy wisps
        g.lineStyle(1, 0xD4B862, 0.6);
        g.lineBetween(cx - 10 + bodyTilt, 8, cx - 10 + bodyTilt, 18);
        g.lineBetween(cx + 9 + bodyTilt, 7, cx + 10 + bodyTilt, 17);
        g.lineBetween(cx - 3 + bodyTilt, -1, cx - 5 + bodyTilt, -4);
        g.lineBetween(cx + 2 + bodyTilt, -1, cx + 4 + bodyTilt, -3);
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
     *  ITEMS — 24x24
     * =================================================================*/

    static _createItemMoney(scene) {
        var P = SpriteFactory.PAL;
        SpriteFactory._tex(scene, 'item-money', 24, 24, function(g) {
            // Green bill
            g.fillStyle(P.green);
            g.fillRect(2, 5, 20, 14);
            // Border
            g.lineStyle(1, 0x228B22);
            g.strokeRect(2, 5, 20, 14);
            // Inner border
            g.lineStyle(1, 0x228B22, 0.5);
            g.strokeRect(4, 7, 16, 10);
            // Dollar sign drawn with lines
            g.lineStyle(2, P.yellow);
            // S-shape approximation
            g.lineBetween(14, 8, 10, 8);
            g.lineBetween(10, 8, 10, 11);
            g.lineBetween(10, 11, 14, 11);
            g.lineBetween(14, 11, 14, 15);
            g.lineBetween(14, 15, 10, 15);
            // Vertical line through $
            g.lineBetween(12, 7, 12, 17);
        });
    }

    static _createItemGoldRecord(scene) {
        var P = SpriteFactory.PAL;
        SpriteFactory._tex(scene, 'item-goldrecord', 24, 24, function(g) {
            // Gold disc
            g.fillStyle(P.gold);
            g.fillCircle(12, 12, 10);
            // Frame ring
            g.lineStyle(2, 0xDAA520);
            g.strokeCircle(12, 12, 10);
            // Center label
            g.fillStyle(P.darkGray);
            g.fillCircle(12, 12, 4);
            // Center hole
            g.fillStyle(P.black);
            g.fillCircle(12, 12, 1);
            // Radiating shine lines
            g.lineStyle(1, P.white, 0.3);
            g.lineBetween(12, 2, 12, 5);
            g.lineBetween(22, 12, 19, 12);
            g.lineBetween(12, 22, 12, 19);
            g.lineBetween(2, 12, 5, 12);
            // Diagonal shines
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

            // Outline
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

            // Sparkle highlight
            g.fillStyle(P.white, 0.5);
            g.fillCircle(10, 8, 2);
        });
    }

    static _createItemNote(scene) {
        SpriteFactory._tex(scene, 'item-note', 24, 24, function(g) {
            // Eighth note
            // Note head
            g.fillStyle(0x7B2FBE);
            g.fillCircle(8, 18, 4);
            // Stem
            g.lineStyle(2, 0x7B2FBE);
            g.lineBetween(12, 18, 12, 4);
            // Flag
            g.fillStyle(0x7B2FBE);
            g.fillTriangle(12, 4, 18, 7, 12, 10);
        });
    }

    static _createItemBottle(scene) {
        var P = SpriteFactory.PAL;
        SpriteFactory._tex(scene, 'item-bottle', 24, 24, function(g) {
            // Body
            g.fillStyle(P.brown);
            g.fillRect(7, 10, 10, 12);
            // Rounded bottom
            g.fillCircle(12, 21, 5);
            g.fillStyle(P.brown);
            g.fillRect(7, 16, 10, 6);
            // Neck
            g.fillStyle(P.brown);
            g.fillRect(10, 3, 4, 8);
            // Cap
            g.fillStyle(P.gold);
            g.fillRect(9, 2, 6, 3);
            // Label
            g.fillStyle(0xF5F5DC);
            g.fillRect(8, 13, 8, 5);
            // Glass shine
            g.lineStyle(1, P.white, 0.5);
            g.lineBetween(9, 5, 11, 12);
        });
    }

    static _createItemSyringe(scene) {
        var P = SpriteFactory.PAL;
        SpriteFactory._tex(scene, 'item-syringe', 24, 24, function(g) {
            // Body (barrel)
            g.fillStyle(P.lightGray);
            g.fillRect(4, 10, 14, 5);
            // Barrel markings
            g.lineStyle(1, P.gray, 0.5);
            g.lineBetween(7, 10, 7, 15);
            g.lineBetween(10, 10, 10, 15);
            g.lineBetween(13, 10, 13, 15);
            // Needle
            g.lineStyle(1, P.gray);
            g.lineBetween(18, 12, 23, 12);
            // Needle tip
            g.fillStyle(P.gray);
            g.fillTriangle(22, 11, 24, 12, 22, 14);
            // Plunger
            g.fillStyle(P.red);
            g.fillRect(1, 10, 4, 5);
            // Plunger handle
            g.fillStyle(P.darkGray);
            g.fillRect(0, 11, 2, 3);
            // Liquid inside
            g.fillStyle(0x33FF33, 0.4);
            g.fillRect(5, 11, 12, 3);
        });
    }

    static _createItemGuitar(scene) {
        var P = SpriteFactory.PAL;
        SpriteFactory._tex(scene, 'item-guitar', 24, 24, function(g) {
            // Guitar body — two overlapping circles (figure-8)
            g.fillStyle(0xCC0000);
            g.fillCircle(10, 18, 6);
            g.fillCircle(10, 12, 5);
            // Sound hole
            g.fillStyle(0x330000);
            g.fillCircle(10, 16, 2);
            // Neck
            g.fillStyle(0x8B4513);
            g.fillRect(8, 2, 4, 11);
            // Headstock
            g.fillStyle(0x222222);
            g.fillRect(7, 0, 6, 3);
            // Tuning pegs
            g.fillStyle(P.lightGray);
            g.fillRect(6, 0, 2, 2);
            g.fillRect(12, 0, 2, 2);
            // Strings
            g.lineStyle(1, P.lightGray, 0.5);
            g.lineBetween(9, 3, 9, 20);
            g.lineBetween(11, 3, 11, 20);
            // Pickguard
            g.fillStyle(0x111111);
            g.fillTriangle(6, 16, 10, 13, 10, 19);
        });
    }

    static _createItemVinyl(scene) {
        var P = SpriteFactory.PAL;
        SpriteFactory._tex(scene, 'item-vinyl', 24, 24, function(g) {
            // Vinyl disc
            g.fillStyle(P.black);
            g.fillCircle(12, 12, 10);
            // Grooves
            g.lineStyle(1, 0x222222, 0.5);
            g.strokeCircle(12, 12, 8);
            g.strokeCircle(12, 12, 6);
            g.strokeCircle(12, 12, 4);
            // Center label
            g.fillStyle(P.red);
            g.fillCircle(12, 12, 3);
            // Center hole
            g.fillStyle(P.white);
            g.fillCircle(12, 12, 1);
            // Shine
            g.lineStyle(1, P.white, 0.15);
            g.lineBetween(6, 6, 18, 18);
        });
    }

    /* ===================================================================
     *  WEAPONS
     * =================================================================*/

    static _createMicStand(scene) {
        var P = SpriteFactory.PAL;
        SpriteFactory._tex(scene, 'mic-stand', 48, 16, function(g) {
            // Stand pole
            g.lineStyle(2, P.gray);
            g.lineBetween(6, 8, 38, 8);
            // Mic head
            g.fillStyle(P.darkGray);
            g.fillCircle(42, 8, 5);
            // Mic grille
            g.lineStyle(1, P.lightGray, 0.5);
            g.lineBetween(40, 5, 40, 11);
            g.lineBetween(42, 4, 42, 12);
            g.lineBetween(44, 5, 44, 11);
            // Base
            g.fillStyle(P.darkGray);
            g.fillTriangle(2, 4, 10, 4, 6, 14);
        });
    }

    /* ===================================================================
     *  DARTBOARD & DARTS
     * =================================================================*/

    static _createDartboard(scene) {
        var P = SpriteFactory.PAL;
        SpriteFactory._tex(scene, 'dartboard', 128, 128, function(g) {
            var cx = 64, cy = 64;

            // Background wood frame
            g.fillStyle(0x5C3A1E);
            g.fillRect(0, 0, 128, 128);

            // Outermost black ring
            g.fillStyle(P.black);
            g.fillCircle(cx, cy, 60);

            // Alternating rings
            var ringColors = [0x228B22, 0xCC2222, P.white, 0x228B22, 0xCC2222, P.white, 0x228B22];
            var ringRadii  = [55, 48, 41, 34, 27, 20, 14];
            for (var i = 0; i < ringColors.length; i++) {
                g.fillStyle(ringColors[i]);
                g.fillCircle(cx, cy, ringRadii[i]);
            }

            // Wire/division lines (thin black radial lines for segments)
            g.lineStyle(1, P.black, 0.6);
            for (var i = 0; i < 20; i++) {
                var angle = (Math.PI * 2 / 20) * i;
                var x2 = cx + Math.cos(angle) * 58;
                var y2 = cy + Math.sin(angle) * 58;
                g.lineBetween(cx, cy, x2, y2);
            }

            // Center bullseye area with face caricature
            g.fillStyle(P.skin);
            g.fillCircle(cx, cy, 12);

            // Face — angry eyebrows
            g.lineStyle(2, P.black);
            g.lineBetween(cx - 7, cy - 5, cx - 2, cy - 3);
            g.lineBetween(cx + 7, cy - 5, cx + 2, cy - 3);

            // Eyes
            g.fillStyle(P.black);
            g.fillCircle(cx - 4, cy - 1, 2);
            g.fillCircle(cx + 4, cy - 1, 2);

            // Mustache
            g.lineStyle(2, P.black);
            g.lineBetween(cx - 5, cy + 3, cx - 1, cy + 5);
            g.lineBetween(cx + 5, cy + 3, cx + 1, cy + 5);

            // Hair on top
            g.fillStyle(P.brownHair);
            g.fillRect(cx - 8, cy - 12, 16, 5);
            // Hair spikes
            g.fillTriangle(cx - 6, cy - 12, cx - 3, cy - 17, cx, cy - 12);
            g.fillTriangle(cx, cy - 12, cx + 3, cy - 17, cx + 6, cy - 12);

            // Mouth (frown)
            g.lineStyle(1, P.black);
            g.lineBetween(cx - 3, cy + 7, cx + 3, cy + 7);

            // Frame outline
            g.lineStyle(3, 0x3E2723);
            g.strokeRect(1, 1, 126, 126);
        });
    }

    static _createDart(scene) {
        var P = SpriteFactory.PAL;
        SpriteFactory._tex(scene, 'dart', 16, 32, function(g) {
            var cx = 8;
            // Pointed tip
            g.fillStyle(P.gray);
            g.fillTriangle(cx - 1, 0, cx + 1, 0, cx, 8);
            // Shaft
            g.fillStyle(P.red);
            g.fillRect(cx - 1, 6, 3, 16);
            // Fins/flights
            g.fillStyle(0xFF6666);
            g.fillTriangle(cx - 1, 22, cx - 6, 30, cx - 1, 28);
            g.fillTriangle(cx + 1, 22, cx + 6, 30, cx + 1, 28);
            // Center fin
            g.fillStyle(P.red);
            g.fillRect(cx - 1, 22, 3, 8);
        });
    }

    static _createCrosshair(scene) {
        SpriteFactory._tex(scene, 'crosshair', 32, 32, function(g) {
            var cx = 16, cy = 16;
            // Circle outline
            g.lineStyle(2, 0xFF4400, 0.9);
            g.strokeCircle(cx, cy, 12);
            // Cross lines
            g.lineStyle(1, 0xFF4400, 0.9);
            g.lineBetween(cx, 1, cx, 10);
            g.lineBetween(cx, 22, cx, 31);
            g.lineBetween(1, cy, 10, cy);
            g.lineBetween(22, cy, 31, cy);
            // Center dot
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
            // Sky / background gradient (dark purple to deep blue)
            var gradColors = [0x0A0015, 0x0E0020, 0x12002A, 0x180035, 0x1E0040, 0x220050];
            for (var i = 0; i < gradColors.length; i++) {
                g.fillStyle(gradColors[i]);
                g.fillRect(0, i * 30, 480, 32);
            }

            // Stage backdrop curtain
            g.fillStyle(0x1A0030);
            g.fillRect(0, 0, 480, 180);
            // Curtain folds
            g.lineStyle(1, 0x2A0050, 0.4);
            for (var x = 0; x < 480; x += 20) {
                g.lineBetween(x, 0, x, 180);
            }

            // Stage lights at top
            var lightColors = [0xFF0000, 0x0066FF, 0x00FF00, 0xFF00FF, 0xFFFF00, 0x00FFFF, 0xFF0000, 0x0066FF];
            for (var i = 0; i < lightColors.length; i++) {
                g.fillStyle(lightColors[i], 0.8);
                g.fillRect(20 + i * 58, 5, 12, 8);
                // Light beam (faint triangle cone)
                g.fillStyle(lightColors[i], 0.06);
                var lx = 26 + i * 58;
                g.fillTriangle(lx - 2, 13, lx + 2, 13, lx + (i % 2 === 0 ? 30 : -30), 180);
                g.fillTriangle(lx - 2, 13, lx + 2, 13, lx + (i % 2 === 0 ? -20 : 20), 180);
            }

            // Truss bars at top
            g.fillStyle(0x333333);
            g.fillRect(0, 0, 480, 4);
            g.fillRect(0, 14, 480, 3);

            // Amp stacks — left side
            for (var row = 0; row < 3; row++) {
                g.fillStyle(P.ampGray);
                g.fillRect(5, 60 + row * 40, 50, 38);
                g.lineStyle(1, 0x555555);
                g.strokeRect(5, 60 + row * 40, 50, 38);
                // Speaker cones
                for (var sx = 0; sx < 2; sx++) {
                    for (var sy = 0; sy < 2; sy++) {
                        g.fillStyle(0x1A1A1A);
                        g.fillCircle(18 + sx * 22, 70 + row * 40 + sy * 16, 6);
                        g.fillStyle(0x333333);
                        g.fillCircle(18 + sx * 22, 70 + row * 40 + sy * 16, 2);
                    }
                }
            }
            // Amp stacks — right side
            for (var row = 0; row < 3; row++) {
                g.fillStyle(P.ampGray);
                g.fillRect(425, 60 + row * 40, 50, 38);
                g.lineStyle(1, 0x555555);
                g.strokeRect(425, 60 + row * 40, 50, 38);
                for (var sx = 0; sx < 2; sx++) {
                    for (var sy = 0; sy < 2; sy++) {
                        g.fillStyle(0x1A1A1A);
                        g.fillCircle(438 + sx * 22, 70 + row * 40 + sy * 16, 6);
                        g.fillStyle(0x333333);
                        g.fillCircle(438 + sx * 22, 70 + row * 40 + sy * 16, 2);
                    }
                }
            }

            // Stage floor
            g.fillStyle(P.stageFloor);
            g.fillRect(0, 190, 480, 80);
            // Floorboard lines
            g.lineStyle(1, 0x4A2E14, 0.5);
            for (var y = 195; y < 270; y += 10) {
                g.lineBetween(0, y, 480, y);
            }
            // Floorboard vertical joints
            for (var x = 30; x < 480; x += 60) {
                var yOffset = (Math.floor(x / 60) % 2) * 5;
                g.lineBetween(x, 190 + yOffset, x, 195 + yOffset);
                g.lineBetween(x, 210 + yOffset, x, 215 + yOffset);
                g.lineBetween(x, 230 + yOffset, x, 235 + yOffset);
                g.lineBetween(x, 250 + yOffset, x, 255 + yOffset);
            }

            // Stage edge / lip
            g.fillStyle(0x777777);
            g.fillRect(0, 188, 480, 4);

            // Crowd silhouette at bottom
            g.fillStyle(0x111111);
            g.fillRect(0, 250, 480, 20);
            // Crowd heads (semi-circles / bumps) — deterministic positions
            for (var x = 5; x < 480; x += 12) {
                g.fillStyle(0x151515 + (x * 37 % 0x0A0A0A));
                g.fillCircle(x, 250, 5 + (x % 3));
            }
            // Crowd lighters / phones
            for (var i = 0; i < 30; i++) {
                var lx = 10 + (i * 16) % 460;
                var ly = 240 + (i * 7) % 15;
                g.fillStyle(P.yellow, 0.7);
                g.fillRect(lx, ly, 2, 3);
                // Tiny glow
                g.fillStyle(P.yellow, 0.15);
                g.fillCircle(lx + 1, ly, 4);
            }

            // Monitor wedges on stage
            g.fillStyle(0x2A2A2A);
            g.fillTriangle(100, 210, 130, 210, 115, 200);
            g.fillTriangle(350, 210, 380, 210, 365, 200);

            // Neon strip along back wall
            g.fillStyle(P.neonPink, 0.3);
            g.fillRect(60, 178, 360, 2);
            g.fillStyle(P.neonBlue, 0.2);
            g.fillRect(60, 176, 360, 2);
        });
    }

    static _createBgBar(scene) {
        var P = SpriteFactory.PAL;
        SpriteFactory._tex(scene, 'bg-bar', 480, 270, function(g) {
            // Dark amber background
            g.fillStyle(0x1A120A);
            g.fillRect(0, 0, 480, 270);

            // Back wall
            g.fillStyle(0x2A1A0E);
            g.fillRect(0, 0, 480, 180);

            // Wood paneling (horizontal planks)
            g.lineStyle(1, 0x3D2B1F, 0.5);
            for (var y = 0; y < 180; y += 15) {
                g.lineBetween(0, y, 480, y);
            }
            // Vertical panel dividers
            g.lineStyle(1, 0x1A0E06, 0.4);
            for (var x = 0; x < 480; x += 80) {
                g.lineBetween(x, 0, x, 180);
            }

            // Wainscoting / dado rail
            g.fillStyle(0x3D2B1F);
            g.fillRect(0, 100, 480, 4);

            // Lower wall darker
            g.fillStyle(0x1E140C);
            g.fillRect(0, 104, 480, 76);
            g.lineStyle(1, 0x2A1A0E, 0.3);
            for (var y = 104; y < 180; y += 12) {
                g.lineBetween(0, y, 480, y);
            }

            // Posters on walls
            var posterColors = [0xCC3333, 0x3333CC, 0x33CC33, 0xCCCC33, 0xCC33CC];
            for (var i = 0; i < 5; i++) {
                var px = 40 + i * 90;
                g.fillStyle(posterColors[i], 0.7);
                g.fillRect(px, 20 + (i % 2) * 15, 24, 32);
                g.lineStyle(1, 0x000000, 0.5);
                g.strokeRect(px, 20 + (i % 2) * 15, 24, 32);
            }

            // Bar shelf (back wall, upper)
            g.fillStyle(0x4A3520);
            g.fillRect(10, 68, 200, 4);
            g.fillRect(10, 92, 200, 4);
            // Bottles on shelves
            var bottleColors = [0x33AA33, 0xAA3333, 0x8B4513, 0xDAA520, 0x4444AA, 0x33AA33, 0xAA3333, 0x8B4513];
            for (var i = 0; i < 8; i++) {
                var bx = 18 + i * 24;
                // Bottle body
                g.fillStyle(bottleColors[i], 0.8);
                g.fillRect(bx, 74, 6, 16);
                // Bottle neck
                g.fillRect(bx + 1, 70, 4, 6);
                // Highlight
                g.lineStyle(1, P.white, 0.2);
                g.lineBetween(bx + 1, 72, bx + 1, 88);
            }
            // Second shelf bottles
            for (var i = 0; i < 6; i++) {
                var bx = 22 + i * 30;
                g.fillStyle(bottleColors[(i + 3) % bottleColors.length], 0.7);
                g.fillRect(bx, 50, 6, 16);
                g.fillRect(bx + 1, 46, 4, 6);
            }

            // Bar counter
            g.fillStyle(0x3D2B1F);
            g.fillRect(0, 170, 480, 14);
            g.fillStyle(0x4A3520);
            g.fillRect(0, 170, 480, 3);
            // Bar front panel
            g.fillStyle(0x2A1808);
            g.fillRect(0, 184, 480, 30);
            // Bar panel detail
            g.lineStyle(1, 0x3D2B1F, 0.3);
            for (var x = 30; x < 480; x += 60) {
                g.strokeRect(x - 20, 186, 40, 26);
            }

            // Floor
            g.fillStyle(0x1A100A);
            g.fillRect(0, 214, 480, 56);
            // Tile pattern
            g.lineStyle(1, 0x2A1A0E, 0.3);
            for (var y = 214; y < 270; y += 14) {
                g.lineBetween(0, y, 480, y);
            }
            for (var x = 0; x < 480; x += 20) {
                g.lineBetween(x, 214, x, 270);
            }

            // Bar stools
            for (var i = 0; i < 4; i++) {
                var stoolX = 80 + i * 100;
                // Stool leg
                g.fillStyle(0x555555);
                g.fillRect(stoolX, 210, 3, 20);
                // Stool base
                g.fillRect(stoolX - 6, 228, 15, 3);
                // Stool seat
                g.fillStyle(P.red, 0.7);
                g.fillRect(stoolX - 5, 205, 13, 6);
            }

            // TV in corner
            g.fillStyle(0x555555);
            g.fillRect(380, 15, 60, 45);
            g.fillStyle(0x1A2A3A);
            g.fillRect(383, 18, 54, 39);
            // TV static — deterministic
            for (var i = 0; i < 40; i++) {
                var tx = 385 + (i * 13) % 50;
                var ty = 20 + (i * 7) % 35;
                g.fillStyle(0x4488AA, 0.3);
                g.fillRect(tx, ty, 2, 1);
            }

            // Neon beer sign
            g.lineStyle(2, P.neonPink, 0.5);
            g.strokeRect(280, 25, 50, 20);
            g.fillStyle(P.neonPink, 0.15);
            g.fillRect(280, 25, 50, 20);

            // Dim lighting feel — vignette overlay
            g.fillStyle(0x000000, 0.15);
            g.fillRect(0, 0, 60, 270);
            g.fillRect(420, 0, 60, 270);
            g.fillStyle(0x332200, 0.08);
            g.fillRect(0, 0, 480, 270);

            // Hanging lights
            for (var i = 0; i < 3; i++) {
                var hx = 120 + i * 120;
                g.lineStyle(1, 0x444444);
                g.lineBetween(hx, 0, hx, 8);
                g.fillStyle(0xFFAA33, 0.6);
                g.fillCircle(hx, 12, 5);
                // Glow
                g.fillStyle(0xFFAA33, 0.05);
                g.fillCircle(hx, 12, 30);
            }
        });
    }

    static _createBgAlley(scene) {
        var P = SpriteFactory.PAL;
        SpriteFactory._tex(scene, 'bg-alley', 480, 270, function(g) {
            // Very dark base
            g.fillStyle(0x0A0D12);
            g.fillRect(0, 0, 480, 270);

            // Sky (barely visible, overcast dark)
            g.fillStyle(0x14191F);
            g.fillRect(0, 0, 480, 50);

            // Left building wall
            g.fillStyle(0x1A1210);
            g.fillRect(0, 20, 140, 250);
            // Right building wall
            g.fillStyle(0x1A1210);
            g.fillRect(340, 20, 140, 250);

            // Brick pattern — left wall
            for (var by = 22; by < 270; by += 8) {
                var offset = (Math.floor(by / 8) % 2) * 10;
                for (var bx = offset; bx < 140; bx += 20) {
                    g.fillStyle(0x3A2218 + (((bx + by) * 7) % 0x0A0808));
                    g.fillRect(bx, by, 18, 6);
                    g.lineStyle(1, 0x0E0A08, 0.5);
                    g.strokeRect(bx, by, 18, 6);
                }
            }
            // Brick pattern — right wall
            for (var by = 22; by < 270; by += 8) {
                var offset = (Math.floor(by / 8) % 2) * 10;
                for (var bx = 340 + offset; bx < 480; bx += 20) {
                    g.fillStyle(0x3A2218 + (((bx + by) * 7) % 0x0A0808));
                    g.fillRect(bx, by, 18, 6);
                    g.lineStyle(1, 0x0E0A08, 0.5);
                    g.strokeRect(bx, by, 18, 6);
                }
            }

            // Back wall / vanishing perspective
            g.fillStyle(0x121518);
            g.fillRect(140, 20, 200, 130);
            // Back wall bricks
            for (var by = 22; by < 150; by += 8) {
                var offset = (Math.floor(by / 8) % 2) * 10;
                for (var bx = 142 + offset; bx < 338; bx += 20) {
                    g.fillStyle(0x2A1A14);
                    g.fillRect(bx, by, 18, 6);
                }
            }

            // Ground / wet asphalt
            g.fillStyle(0x14181C);
            g.fillRect(0, 190, 480, 80);
            // Ground cracks
            g.lineStyle(1, 0x1E2228, 0.4);
            g.lineBetween(100, 200, 200, 240);
            g.lineBetween(200, 240, 280, 230);
            g.lineBetween(350, 210, 300, 250);

            // Dumpster (left side)
            g.fillStyle(0x2A4A2A);
            g.fillRect(20, 160, 60, 35);
            g.lineStyle(1, 0x1A3A1A);
            g.strokeRect(20, 160, 60, 35);
            // Dumpster lid
            g.fillStyle(0x2A4A2A);
            g.fillRect(18, 157, 64, 5);
            // Handle
            g.fillStyle(0x444444);
            g.fillRect(45, 170, 8, 3);

            // Fire escape on left wall
            g.fillStyle(0x333333);
            g.fillRect(90, 40, 40, 3);
            g.fillRect(90, 80, 40, 3);
            g.fillRect(90, 120, 40, 3);
            // Ladders
            g.lineStyle(1, 0x444444);
            g.lineBetween(95, 40, 95, 80);
            g.lineBetween(120, 40, 120, 80);
            g.lineBetween(95, 80, 95, 120);
            g.lineBetween(120, 80, 120, 120);
            // Rungs
            for (var ry = 48; ry < 120; ry += 8) {
                g.lineBetween(95, ry, 120, ry);
            }

            // Broken neon sign on right wall
            g.lineStyle(2, P.neonPink, 0.4);
            g.strokeRect(360, 50, 70, 20);
            // Broken part (gap)
            g.fillStyle(0x1A1210);
            g.fillRect(395, 50, 15, 20);
            // Remaining neon glow
            g.fillStyle(P.neonPink, 0.06);
            g.fillRect(355, 45, 80, 30);
            // Flickering letter fragments
            g.lineStyle(2, P.neonPink, 0.3);
            g.lineBetween(365, 55, 365, 65);
            g.lineBetween(365, 55, 375, 55);
            g.lineBetween(375, 55, 375, 60);
            g.lineBetween(420, 55, 425, 65);
            g.lineBetween(425, 55, 420, 65);

            // Puddles on ground
            for (var i = 0; i < 6; i++) {
                var px = 150 + i * 40 + (i * 17) % 20;
                var py = 210 + (i * 13) % 30;
                g.fillStyle(0x1A2535, 0.5);
                g.fillEllipse(px, py, 20 + (i % 3) * 8, 4 + (i % 2) * 2);
                // Subtle reflection
                g.fillStyle(0x334466, 0.15);
                g.fillEllipse(px, py - 1, 14 + (i % 3) * 4, 2);
            }

            // Steam/fog from grate
            g.fillStyle(0x667788, 0.08);
            g.fillEllipse(250, 195, 60, 20);
            g.fillEllipse(260, 185, 40, 15);
            g.fillEllipse(245, 175, 30, 12);

            // Graffiti on right wall (small colored marks)
            g.fillStyle(0xFF3333, 0.3);
            g.fillRect(370, 100, 30, 15);
            g.fillStyle(0x33FF33, 0.2);
            g.fillRect(395, 90, 20, 12);
            g.lineStyle(2, 0xFFFF33, 0.3);
            g.lineBetween(350, 130, 380, 120);
            g.lineBetween(380, 120, 400, 135);

            // Newspaper on ground
            g.fillStyle(0xBBBBAA, 0.3);
            g.fillRect(300, 230, 12, 8);
            g.fillRect(302, 238, 10, 6);

            // Dark oppressive overlay
            g.fillStyle(0x000000, 0.2);
            g.fillRect(0, 0, 480, 270);

            // Vignette edges
            g.fillStyle(0x000000, 0.3);
            g.fillRect(0, 0, 20, 270);
            g.fillRect(460, 0, 20, 270);
            g.fillRect(0, 0, 480, 10);
        });
    }

    /* ===================================================================
     *  PARTICLES
     * =================================================================*/

    static _createParticleRain(scene) {
        SpriteFactory._tex(scene, 'particle-rain', 2, 8, function(g) {
            // Simple blue-white vertical line gradient
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
            // Bright center
            g.fillStyle(0xFFFFFF, 0.7);
            g.fillRect(1, 1, 2, 2);
        });
    }

    /* ===================================================================
     *  HUD
     * =================================================================*/

    static _createHealthBarFrame(scene) {
        var P = SpriteFactory.PAL;
        SpriteFactory._tex(scene, 'healthbar-frame', 100, 16, function(g) {
            // Outer border
            g.fillStyle(P.darkGray);
            g.fillRect(0, 0, 100, 16);
            // Inner dark area
            g.fillStyle(0x1A1A1A);
            g.fillRect(2, 2, 96, 12);
            // Subtle highlight on top edge
            g.lineStyle(1, 0x666666, 0.5);
            g.lineBetween(1, 1, 99, 1);
            // Shadow on bottom edge
            g.lineStyle(1, 0x222222, 0.8);
            g.lineBetween(1, 15, 99, 15);
        });
    }

    static _createHealthBarFill(scene) {
        SpriteFactory._tex(scene, 'healthbar-fill', 96, 12, function(g) {
            // Green fill
            g.fillStyle(0x00CC00);
            g.fillRect(0, 0, 96, 12);
            // Highlight stripe
            g.fillStyle(0x00FF00, 0.4);
            g.fillRect(0, 1, 96, 4);
            // Bottom shadow
            g.fillStyle(0x008800, 0.5);
            g.fillRect(0, 9, 96, 3);
        });
    }

    /* ===================================================================
     *  VIRTUAL BUTTONS (semi-transparent, for mobile)
     * =================================================================*/

    static _createBtnLeft(scene) {
        SpriteFactory._tex(scene, 'btn-left', 48, 48, function(g) {
            var cx = 24, cy = 24;
            // Dark circle bg
            g.fillStyle(0x000000, 0.4);
            g.fillCircle(cx, cy, 22);
            g.lineStyle(2, 0xFFFFFF, 0.3);
            g.strokeCircle(cx, cy, 22);
            // Left arrow
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
            // Right arrow
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
            // "A" letter
            g.lineStyle(3, 0xFF4444, 0.8);
            // Left leg of A
            g.lineBetween(cx - 8, cy + 10, cx, cy - 10);
            // Right leg of A
            g.lineBetween(cx + 8, cy + 10, cx, cy - 10);
            // Cross bar of A
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
            // "S" letter
            g.lineStyle(3, 0x44AAFF, 0.8);
            g.lineBetween(cx + 6, cy - 8, cx - 4, cy - 8);
            g.lineBetween(cx - 4, cy - 8, cx - 4, cy);
            g.lineBetween(cx - 4, cy, cx + 4, cy);
            g.lineBetween(cx + 4, cy, cx + 4, cy + 8);
            g.lineBetween(cx + 4, cy + 8, cx - 6, cy + 8);
        });
    }
}
