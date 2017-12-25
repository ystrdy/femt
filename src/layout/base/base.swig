<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
        <meta name="renderer" content="webkit">
        <title>BZ55.com小说库</title>
        <meta name="keywords" content="BZ55.com小说库">
        <meta name="description" content="BZ55.com小说库">
        <base target="_blank">
        {% block style %}{% endblock %}
    </head>
    <body class="root-{{file.name}}">
        {% block container %}{% endblock %}
        {% block script %}{% endblock %}
        {% block statistics %}
        <div class="hidden">
            <!-- 统计代码 -->
        </div>
        {% endblock %}
    </body>
</html>