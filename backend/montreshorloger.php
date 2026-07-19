<?php
/**
 * Gestion des montres — HorlogerAixois
 *
 * Version enrichie du script d'origine :
 *   - GET            : liste des montres, ou une montre via ?id=
 *   - POST (ajout)   : sans `id`               -> INSERT (+ upload images)
 *   - POST (édition) : avec `id`               -> UPDATE (otherData préservé)
 *   - POST (suppr.)  : `action=delete` + `id`  -> DELETE (+ dossier images)
 *
 * ⚠️ Sécurité : penser à protéger les écritures (ajout/édition/suppression)
 *    par une authentification côté serveur avant mise en production.
 */

ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/debug.log');

function logDebug($label, $data = null) {
    error_log("==== $label ====");
    if ($data !== null) {
        error_log(print_r($data, true));
    }
}

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

// =====================
// PDO
// =====================
try {
    $pdo = new PDO(
        'mysql:host=chiyanhadmin.mysql.db;dbname=chiyanhadmin;charset=utf8',
        'chiyanhadmin',
        'MC22e7ee3a',
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );
} catch (Throwable $e) {
    logDebug('PDO ERROR', $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'PDO connection failed']);
    exit;
}

// Colonnes SQL de la table
$fields = [
    'brand', 'model', 'year', 'movementType', 'caliber',
    'powerReserve', 'frequency', 'waterResistance',
    'case', 'caseBack', 'glass', 'dial',
    'lugWidth', 'buckle', 'size', 'crown',
    'bezel', 'indexes', 'wristSize', 'buckleWidth'
];

/** Supprime récursivement un dossier (les images d'une montre). */
function deleteDir($dir) {
    if (!is_dir($dir)) return;
    foreach (array_diff(scandir($dir), ['.', '..']) as $f) {
        $path = $dir . '/' . $f;
        is_dir($path) ? deleteDir($path) : @unlink($path);
    }
    @rmdir($dir);
}

// =====================
// GET
// =====================
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        if (!empty($_GET['id'])) {
            $stmt = $pdo->prepare("SELECT * FROM horlogermontres WHERE id = :id");
            $stmt->execute(['id' => (int)$_GET['id']]);
            $watch = $stmt->fetch();
            if ($watch && !empty($watch['otherData'])) {
                $watch['otherData'] = json_decode($watch['otherData'], true);
            }
            echo json_encode($watch ?: []);
        } else {
            $stmt = $pdo->query("SELECT * FROM horlogermontres ORDER BY id DESC");
            $watches = $stmt->fetchAll();
            foreach ($watches as &$watch) {
                if (!empty($watch['otherData'])) {
                    $watch['otherData'] = json_decode($watch['otherData'], true);
                }
            }
            echo json_encode($watches);
        }
        exit;
    } catch (Throwable $e) {
        logDebug('GET ERROR', $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'GET failed']);
        exit;
    }
}

// =====================
// POST
// =====================
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $action = $_POST['action'] ?? null;

        // ---- Suppression ----
        if ($action === 'delete') {
            if (empty($_POST['id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'missing id']);
                exit;
            }
            $id = (int)$_POST['id'];
            $stmt = $pdo->prepare("DELETE FROM horlogermontres WHERE id = :id");
            $stmt->execute(['id' => $id]);
            deleteDir(__DIR__ . '/watches/' . $id);
            echo json_encode(['deleted' => $id]);
            exit;
        }

        // ---- Ajout / Édition ----
        $data = [];
        $otherData = [];

        foreach ($_POST as $key => $value) {
            if (in_array($key, $fields, true)) {
                $data[$key] = $value;
            } elseif (!in_array($key, ['id', 'otherData', 'action'], true)) {
                $otherData[$key] = $value;
            }
        }

        if (!empty($_POST['otherData'])) {
            $decoded = json_decode($_POST['otherData'], true);
            if (is_array($decoded)) {
                $otherData = array_merge($otherData, $decoded);
            }
        }

        $isUpdate = !empty($_POST['id']);

        if ($isUpdate) {
            $sql = "UPDATE horlogermontres SET " .
                implode(', ', array_map(fn($f) => "`$f` = :$f", $fields)) .
                ", `otherData` = :otherData WHERE id = :id";
        } else {
            $sql = "INSERT INTO horlogermontres (" .
                implode(',', array_map(fn($f) => "`$f`", $fields)) . ", `otherData`) VALUES (:" .
                implode(', :', $fields) . ", :otherData)";
        }

        $stmt = $pdo->prepare($sql);
        foreach ($fields as $field) {
            $stmt->bindValue(":$field", $data[$field] ?? null);
        }
        $stmt->bindValue(':otherData', json_encode($otherData, JSON_UNESCAPED_UNICODE));
        if ($isUpdate) {
            $stmt->bindValue(':id', (int)$_POST['id'], PDO::PARAM_INT);
        }
        $stmt->execute();

        $watchId = $isUpdate ? (int)$_POST['id'] : (int)$pdo->lastInsertId();

        // ---- Images (ajout à la suite des existantes) ----
        if (!empty($_FILES['images'])) {
            $watchDir = __DIR__ . '/watches/' . $watchId . '/';
            if (!is_dir($watchDir) && !mkdir($watchDir, 0775, true)) {
                throw new Exception("Impossible de créer le dossier $watchDir");
            }

            // On repart des images déjà connues (utile en édition)
            $images = is_array($otherData['images'] ?? null) ? $otherData['images'] : [];
            $start = count($images);
            $count = count($_FILES['images']['name']);

            for ($i = 0; $i < $count; $i++) {
                if (($_FILES['images']['error'][$i] ?? null) !== UPLOAD_ERR_OK) continue;
                $ext = strtolower(pathinfo($_FILES['images']['name'][$i], PATHINFO_EXTENSION));
                $filename = ($start + $i) . '.' . $ext;
                if (move_uploaded_file($_FILES['images']['tmp_name'][$i], $watchDir . $filename)) {
                    $images[] = $filename;
                }
            }

            $otherData['images'] = $images;
            $stmt = $pdo->prepare("UPDATE horlogermontres SET `otherData` = :otherData WHERE id = :id");
            $stmt->execute([
                'otherData' => json_encode($otherData, JSON_UNESCAPED_UNICODE),
                'id' => $watchId
            ]);
        }

        echo json_encode(['id' => $watchId]);
        exit;

    } catch (Throwable $e) {
        logDebug('POST ERROR', $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'POST failed']);
        exit;
    }
}
