<?
$demo = COption::GetOptionString("citfact","demo");

if($demo && file_exists(__DIR__ . '/' . $demo)){
    require $demo;
}
?>



