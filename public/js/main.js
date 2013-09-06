$(document).ready(function(){
	$('button#update').click(function(){
		$.ajax({
			type: 'POST',
			url: '/update',
			data: {
				name: window.localStorage.getItem('name'),
				phone: $('input#phone').val(),
				address: $('input#address').val(),
				remark: $('input#remark').val(),
				session: window.localStorage.getItem('session')
			}
		}).done(function(data){
			if(data == 'success') {
				alert('记录修改成功。');
				$('input#phone')[0].placeholder = $('input#phone').val();
				$('input#address')[0].placeholder = $('input#address').val();
				// 修改对应列
				var rows = $('tr');
				for(var i=0, len=rows.length; i < len; ++i) {
					var col = rows[i];
					if($(col.children[0]).text() == window.localStorage.name) {
						$(col.children[1]).text($('input#phone').val());
						$(col.children[2]).text($('input#address').val());
						$(col.children[3]).text($('input#remark').val());
						return ;
					}
				}
			} else {
				alert('修改失败。' + data);
			}
		});
	});

	$('button#update-pswd').click(function(){
		var newPswd = $('input#now-pswd').val();
		var retPswd = $('input#retype-pswd').val();
		
		if(newPswd.length < 6) {
			alert('密码长度过低');
			return ;
		} else if(newPswd != retPswd) {
			alert('两次密码输入不一致');
			return ;
		}

		$.ajax({
			type: 'POST',
			url: '/update-pswd',
			data: {
				oldpswd: $('input#old-pswd').val(),
				newpswd: $('input#now-pswd').val(),
				name: window.localStorage.getItem('name'),
				session: window.localStorage.getItem('session')
			}
		}).done(function(data){
			if(data.info == 'success') {
				alert('密码修改成功。');
				$('input#old-pswd').val("");
				$('input#now-pswd').val("");
				$('input#retype-pswd').val("");
				window.localStorage.setItem('session', data.session);
			} else {
				alert("密码修改失败。");
			}
		})
	});
});