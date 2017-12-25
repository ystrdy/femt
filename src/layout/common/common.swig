{% extends "layout:base" %}

{% block style %}
{% parent %}
<link rel="stylesheet" type="text/css" href="css/common.css">
{% endblock %}

{% block container %}
{% include "module:TopBar" %}
{% include "module:LogoBar" %}
{% include "module:NavBar" %}
{% include "module:NavHotCategory" %}
{% block content %}{% endblock %}
{% include "module:FilterBar" %}
{% include "module:FriendLinks" %}
{% include "module:FooterBar" %}
{% endblock %}

{% block script %}
{% parent %}
<script src="js/common.js"></script>
{% endblock %}