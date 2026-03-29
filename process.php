<?php
// 1. Настройки подключения
$user = 'u82196';
$pass = '4736526';
$db_name = 'u82196';
$host = 'localhost';

try {
    $db = new PDO("mysql:host=$host;dbname=$db_name", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
} catch (PDOException $e) {
    die("Ошибка подключения к БД: " . $e->getMessage());
}

// 2. Проверка метода запроса
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: index.html');
    exit();
}

// 3. Сбор и валидация данных
$name = $_POST['fullName'] ?? '';
$email = $_POST['email'] ?? '';
$phone = $_POST['phone'] ?? '';
$bday = $_POST['bdate'] ?? null;
$sex = $_POST['gender'] ?? '';
$bio = $_POST['bio'] ?? '';
$selected_languages = $_POST['languages'] ?? [];

// Простая проверка обязательных полей
if (empty($name) || empty($email) || empty($selected_languages)) {
    die("Пожалуйста, заполните все обязательные поля и выберите хотя бы один язык.");
}

try {
    // 4. Вставка в основную таблицу (application)
    $stmt = $db->prepare("INSERT INTO application (name, email, number, bday, sex, bio) 
                          VALUES (:name, :email, :phone, :bday, :sex, :bio)");
    
    $stmt->execute([
        'name'  => $name,
        'email' => $email,
        'phone' => $phone,
        'bday'  => $bday,
        'sex'   => $sex,
        'bio'   => $bio
    ]);

    // Получаем ID только что созданной записи
    $application_id = $db->lastInsertId();

    // 5. Вставка в таблицу связей (application_languages)
    // Используем цикл foreach, как просили в задании
    $stmt_lang = $db->prepare("INSERT INTO application_languages (application_id, language_id) 
                               VALUES (:app_id, :lang_id)");

    foreach ($selected_languages as $lang_id) {
        $stmt_lang->execute([
            'app_id' => $application_id,
            'lang_id' => $lang_id
        ]);
    }

    echo "<h1>Успех!</h1>";
    echo "<p>Ваша заявка (ID: $application_id) успешно сохранена.</p>";
    echo '<a href="index.html">Вернуться назад</a>';

} catch (PDOException $e) {
    echo "Ошибка сохранения в БД: " . $e->getMessage();
}
