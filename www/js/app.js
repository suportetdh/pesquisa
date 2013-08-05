var app = {
	users: {
		auth: function(login, password) {
			var self = this;
			var url = 'http://www.rodoviariadegoiania.com/sistemas/pesquisa/index.php/login/phone';
			var header = $('#login .header');
			$.ajax({
				url: url,
				type: 'POST',
				data: {'login': login, 'password': password},
				dataType: 'jsonp',
				crossDomain: true,
				timeout: 5000,
				beforeSend: function() {
					header.append('<img class="loading" src="img/loading.gif" alt="" />');
				},
				success: function(data, status, xhr) {
					if(data.type == 'error') {
						navigator.notification.alert(data.content, function() {}, 'Alerta!');
					} else if(data.type == 'success') {
						self.setToken(data.token);
						
						var user = {
								'id': data.id,
								'name': data.nome,
								'lastname': data.sobrenome,
								'email': data.email
						};
						
						self.set(user);
						
						/**
						 * Redireciona para pagina de inicial
						 */
						window.location.replace('index.html');
					}
				},
				error: function(xhr, status, error) {
					navigator.notification.alert('Nao foi possivel conectar ao servidor!', function() {}, 'Ocorreu um erro!');
				},
				complete: function(xhr, status) {
					header.find('.loading').remove();
				}
			});
		},
		logged: function() {
			var self = this;
			
			if(self.getToken()) {
				return true;
			}
			
			return false;
		},
		set: function(user) {
			window.localStorage.setItem('user', JSON.stringify(user));
		},
		get: function() {
			var user = JSON.parse( window.localStorage.getItem('user') );
			return user;
		},
		setToken: function(token) {
			window.localStorage.setItem('token', token);
		},
		getToken: function() {
			var token = window.localStorage.getItem('token');
			return token;
		},
		clear: function() {
			window.localStorage.removeItem('token');
			window.localStorage.removeItem('user');
		}
	},
	groups: {
		set: function(key, value) {
			var groups = JSON.parse( window.localStorage.getItem('groups') ) || {};
			groups[key] = value;
			window.localStorage.setItem( 'groups', JSON.stringify(groups) );
		},
		get: function() {
			var groups = JSON.parse(window.localStorage.getItem('groups'));
			return groups;
		},
		clear: function() {
			window.localStorage.removeItem('groups');
		},
		sync: function(uid, token) {
			var self = this;
			var url = 'http://www.rodoviariadegoiania.com/sistemas/pesquisa/index.php/sincronizar/pergunta/' + uid + '/' + token;
			var header = $('#main .header');
			
			$.ajax({
				url: url,
				type: 'POST',
				dataType: 'jsonp',
				crossDomain: true,
				timeout: 12000,
				beforeSend: function() {
					self.setStatus(true);
					header.append('<img class="loading" src="img/loading.gif" alt="" />');
				},
				success: function(data, status, xhr) {
					if(data.type == 'error') {
						navigator.notification.alert(data.content, function() {}, 'Alerta!');
					} else if(data.type == 'success') {
						self.clear();
						
						$.map(data.content, function(item) {
							self.set(item.id, item);
						});
						
						navigator.notification.alert('Perguntas sincronizadas com sucesso!', function() {}, 'Sucesso');
					};
				},
				error: function(xhr, status, error) {
					navigator.notification.alert('Nao foi possivel conectar ao servidor!', function() {}, 'Ocorreu um erro!');
				},
				complete: function(xhr, status) {
					self.setStatus(false);
					header.find('.loading').remove();
				}
			});
		},
		setStatus: function(status) {
			window.localStorage.setItem('status', status);
		},
		getStatus: function() {
			return window.localStorage.getItem('status');
		}
	},
	searches: {
		set: function(value) {
			var searches = JSON.parse( window.localStorage.getItem('searches') ) || {};
			var key = (Object.keys(searches).length > 0 ? Object.keys(searches).length + 1 : 1);
			
			searches[key] = value;
			
			window.localStorage.setItem( 'searches', JSON.stringify(searches) );
		},
		get: function() {
			var searches = JSON.parse(window.localStorage.getItem('searches'));
			var aux = {
					'searches': searches
			};
			
			return aux;
		},
		clear: function() {
			window.localStorage.removeItem('searches');
		},
		sync: function(uid, token) {
			var self = this;
			var url = 'http://www.rodoviariadegoiania.com/sistemas/pesquisa/index.php/sincronizar/pesquisa/' + uid + '/' + token;
			var header = $('#main .header');
			
			$.ajax({
				url: url,
				type: 'POST',
				data: self.get(),
				dataType: 'jsonp',
				crossDomain: true,
				timeout: 120000,
				beforeSend: function() {
					self.setStatus(true);
					header.append('<img class="loading" src="img/loading.gif" alt="" />');
				},
				success: function(data, status, xhr) {
					if(data.type == 'error') {
						navigator.notification.alert(data.content, function() {}, 'Alerta!');
					} else if(data.type == 'success') {
						self.clear();
						navigator.notification.alert(data.content, function() {}, 'Sucesso');
					}					
				},
				error: function(xhr, status, error) {
					navigator.notification.alert('Nao foi possivel conectar ao servidor: ' + error, function() {}, 'Ocorreu um erro!');
				},
				complete: function(xhr, status) {
					self.setStatus(false);
					header.find('.loading').remove();
				}
			});
		},
		setStatus: function(status) {
			window.localStorage.setItem('status', status);
		},
		getStatus: function() {
			return window.localStorage.getItem('status');
		}
	},
	search: {
		set: function(key, value) {
			var search = JSON.parse( window.localStorage.getItem('search') ) || {};
			if(key == 'nome') {
				search[key] = value;
			} else {
				var answers = (search.respostas) || [];
				answers.push(value);
				search['respostas'] = answers;
			}
			
			window.localStorage.setItem( 'search', JSON.stringify(search) );
		},
		get: function() {
			var search = JSON.parse(window.localStorage.getItem('search'));
			return search;
		},
		clear: function() {
			window.localStorage.removeItem('search');
		}
	},
	dialogGroup: function() {
		var groups = this.groups.get();
		var html = '';
		
		$('#dialog-group').remove();
		
		if($('#dialog-group').length == 0) {
			html += '<div data-role="dialog" id="dialog-group">';
			html += '	<div data-role="header" data-theme="b"><h1>NOVA PESQUISA</h1></div>';
			html += '	<div data-role="content" data-theme="c">';
			html += '		<h2>Selecione o grupo de perguntas:</h2>';
			html += '		<div id="groups">';
			
			if(groups) {
				for(i in groups) {
					html += '<a href="#group-' + groups[i].id + '-01" data-groupid="' + groups[i].id+ '" data-role="button" data-theme="b">' + groups[i].nome + '</a>';
				}
			} else {
				html += '<h3>N&atilde;o h&aacute; grupos!</h3>';
			}
			
			html += '		</div>';
			html += '		<a href="#" data-role="button" data-rel="back" data-theme="a">Cancelar</a>';
			html += '	</div>';
			html += '</div>';
		}
		
		return html;
	},
	dialogSyncQuestions: function() {
		var html = '';
		if($('#dialog-questions').length == 0) {
			html += '<div data-role="dialog" id="dialog-questions">';
			html += '	<div data-role="header" data-theme="b"><h1>SINCRONIZAR PERGUNTAS</h1></div>';
			html += '	<div data-role="content" data-theme="c">';
			html += '		<h2>Deseja sincronizar as perguntas do servidor?</h2>';
			html += '		<a href="index.html" class="sync" data-role="button" data-rel="back" data-theme="b">Sim</a>';
			html += '		<a href="#" data-role="button" data-rel="back" data-theme="a">Cancelar</a>';
			html += '	</div>';
			html += '</div>';
		}
		return html;
	},
	dialogSyncSearches: function() {
		var html = '';
		if($('#dialog-searches').length == 0) {
			html += '<div data-role="dialog" id="dialog-searches">';
			html += '	<div data-role="header" data-theme="b"><h1>SINCRONIZAR PESQUISAS</h1></div>';
			html += '	<div data-role="content" data-theme="c">';
			html += '		<h2>Deseja sincronizar as pesquisas com o servidor?</h2>';
			html += '		<a href="index.html" class="sync" data-role="button" data-rel="back" data-theme="b">Sim</a>';
			html += '		<a href="#" data-role="button" data-rel="back" data-theme="a">Cancelar</a>';
			html += '	</div>';
			html += '</div>';
		}
		return html;
	},
	dialogLogout: function() {
		var html = '';
		if($('#dialog-logout').length == 0) {
			html += '<div data-role="dialog" id="dialog-logout">';
			html += '	<div data-role="header" data-theme="b"><h1>SAIR DO SISTEMA</h1></div>';
			html += '	<div data-role="content" data-theme="c">';
			html += '		<h2>Deseja realmente sair do sistema?</h2>';
			html += '		<a href="index.html" class="logout" data-role="button" data-theme="b">Sim</a>';
			html += '		<a href="index.html" class="close" data-role="button" data-theme="b">Apenas fechar</a>';
			html += '		<a href="#" data-role="button" data-rel="back" data-theme="a">Cancelar</a>';
			html += '	</div>';
			html += '</div>';
		}
		return html;
	},
	pagesGroup: function(i) {
		var groups = this.groups.get();
		var html = '';
		var group = groups[i];
		var perguntas = group.perguntas;
		
		// pergunta do nome do participante
		if($('#group-' + group.id + '-0').length == 0) {
			html += '<div data-role="page" id="group-' + group.id + '-01">';
			html += '	<div data-role="header" data-theme="b" class="header">';
			html += '		<img class="image" src="img/logo-rodoviaria-mobile-white.png" alt=" " />';
			html += '		<h1 class="heading">' + group.nome + '</h1>';
			html += '	</div>';
			html += '	<div data-role="content" class="content">';
			html += '		<div class="info-text">' + 
								'<p>Seja bem-vindo &agrave; Pesquisa de Satisfa&ccedil;&atilde;o do</p>' + 
								'<p><strong>Terminal Rodovi&aacute;rio de Goi&acirc;nia!</strong></p>' + 
							'</div>';
			html += '		<div class="form">';
			html += '			<div class="field">'
			html += '				<label class="group-label" for="nome">Qual o seu nome?</label>';
			html += '				<input type="text" name="nome" id="nome" class="group-text-question" />';
			html += '			</div>';
			html += '			<a ' 
									+ ' href="#group-' + group.id + '-' + perguntas[0].id + '" ' 
									+ ' data-key="nome" ' 
									+ ' data-value="" class="group-button-question" data-role="button" data-theme="b" data-icon="arrow-r" data-iconpos="right">Iniciar pesquisa</a>';
			html += '		</div>';
			html += '	</div>';
			html += '	<div class="footer" data-role="footer" data-position="fixed" data-theme="c"><p class="copyright"><span>&copy; 2013 - Rodovi&aacute;ria de Goi&acirc;nia</span><img src="img/logo-tdh.png" alt="TDH Websites" /></p></div>';
			html += '</div>';
		}
		
		// listagem de perguntas
		var posicao = 1;
		var total = perguntas.length;
		for(j in perguntas) {
			var n = (parseInt(j) + 1);
			
			if($('#group-' + group.id + '-' + perguntas[j].id).length == 0) {
				html += '<div data-role="page" id="group-' + group.id + '-' + perguntas[j].id + '">';
				html += '	<div data-role="header" data-theme="b" class="header">';
				html += '		<img class="image" src="img/logo-rodoviaria-mobile-white.png" alt=" " />';
				html += '		<h1 class="heading">' + group.nome + ' (' + posicao + '/' + total + ')</h1>';
				html += '	</div>';
				html += '	<div data-role="content" class="content">';
				html += '		<div class="form">';
				html += '			<label class="group-label">' + perguntas[j].texto + '</label>';
				
				for(k in perguntas[j].opcoes) {
					html += '		<div class="field">';
					
					if((perguntas.length - 1) == j) {
						html += '		<a ' 
											+'href="#thanks"'  
											+ ' class="group-button-question" ' 
											+ ' data-key="concluir" '
											+ ' data-value="' + perguntas[j].opcoes[k].nome + '" '
											+ ' data-groupid="' + group.id + '" '
											+ ' data-questionid="' + perguntas[j].id + '" '
											+ ' data-typeid="' + perguntas[j].tipo + '" '
											+ ' data-optionid="' + perguntas[j].opcoes[k].id + '" '
											+ ' data-role="button" data-icon="arrow-r" data-iconpos="right">' 
												+ perguntas[j].opcoes[k].nome 
										+ '</a>';
					} else {
						html += '		<a ' 
											+'href="#group-' + group.id + '-' + ( perguntas[n] != undefined ? perguntas[n].id : '02' ) + '"'  
											+ ' class="group-button-question" '
											+ ' data-value="' + perguntas[j].opcoes[k].nome + '" '
											+ ' data-groupid="' + group.id + '" '
											+ ' data-questionid="' + perguntas[j].id + '" '
											+ ' data-typeid="' + perguntas[j].tipo + '" '
											+ ' data-optionid="' + perguntas[j].opcoes[k].id + '" '
											+ ' data-role="button" data-icon="arrow-r" data-iconpos="right">' 
											+ perguntas[j].opcoes[k].nome 
										+ '</a>';
					}
					
					html += '		</div>';
				}
				
				html += '		</div>';
				html += '	</div>';
				html += '	<div class="footer" data-role="footer" data-position="fixed" data-theme="c"><p class="copyright"><span>&copy; 2013 - Rodovi&aacute;ria de Goi&acirc;nia</span><img src="img/logo-tdh.png" alt="TDH Websites" /></p></div>';
				html += '</div>';
				
				posicao++;
			}
		}
		
		/*if($('#group-' + group.id + '-' + (perguntas.length + 1)).length == 0) {
			// pergunta para concluir pesquisa
			html += '<div data-role="page" id="group-' + group.id + '-02">';
			html += '	<div data-role="header" data-theme="b" class="header">';
			html += '		<img class="image" src="img/logo-rodoviaria-mobile-white.png" alt=" " />';				
			html += '		<h1 class="heading">' + group.nome + '</h1>';
			html += '	</div>';
			html += '	<div data-role="content" class="content">';
			html += '		<div>';
			html += '			<label class="group-label">O que voc&ecirc; deseja?</label>';
			html += '			<a href="#thanks" class="group-button-conclude" ' 
									+ ' data-groupprefix="group-' + group.id + '-"' 
									+ ' data-groupid="' + group.id + '"' 
									+ ' data-role="button" data-theme="b" data-icon="check" data-iconpos="right">Concluir</a>';
			html += '			<a href="#dialog-group"'
									+ ' class="group-button-conclude-new"'
									+ ' data-rel="dialog"'
									+ ' data-role="button"'
									+ ' data-theme="b"'
									+ ' data-icon="plus" '
									+ ' data-iconpos="right">Nova pesquisa</a>';
			html += '		</div>';
			html += '	</div>';
			html += '	<div class="footer" data-role="footer" data-theme="c"><p class="copyright"><span>&copy; 2013 - Rodovi&aacute;ria de Goi&acirc;nia</span><img src="img/logo-tdh.png" alt="TDH Websites" /></p></div>';
			html += '</div>';
		}*/
		
		return html;
	},
	pageLogin: function() {
		var html = '';
		html += '	<div data-role="page" id="login">'
				+ '		<div data-role="header" data-theme="b" class="header">'
				+ '			<img class="image" src="img/logo-rodoviaria-mobile-white.png" alt=" " />'
				+ '			<h1 class="heading">GEST&Atilde;O DA QUALIDADE - LOGIN</h1>'
				+ '		</div>'
				+ '		<div data-role="content" class="content">'
				+ '			<form action="index.html" class="form">'
				+ '				<div class="field">'
				+ '					<input type="text" name="login" id="login" tabindex="1" autofocus />'
				+ '				</div>'
				+ '				<div class="field">'
				+ '					<input type="password" name="password" id="password" tabindex="2" />'
				+ '				</div>'
				+ '				<div class="button">'
				+ '					<button type="submit" data-theme="b" tabindex="3">Acessar</button>'
				+ '				</div>'
				+ '			</form>'
				+ '		</div>'
				+ '		<div class="footer" data-role="footer" data-position="fixed" data-theme="c"><p class="copyright"><span>&copy; 2013 - Rodovi&aacute;ria de Goi&acirc;nia</span><img src="img/logo-tdh.png" alt="TDH Websites" /></p></div>'
				+ '	</div>';
		
		return html;
	},
	pageThanks: function() {
		var html = '';
		
		if($('#thanks').length == 0) {
		html += '	<div data-role="page" id="thanks">'
				+ '		<div data-role="header" data-theme="b" class="header">'
				+ '			<img class="image" src="img/logo-rodoviaria-mobile-white.png" alt=" " />'
				+ '			<h1 class="heading">Obrigado</h1>'
				+ '		</div>'
				+ '		<div data-role="content" class="content">'
				+ '			<div class="info-text">'
				+ '				<p>Obrigado por participar da Pesquisa de Satisfa&ccedil;&atilde;o do</p>'
				+ '				<p><strong>Terminal Rodovi&aacute;rio de Goi&acirc;nia!</strong></p>'
				+ '			</div>'
				+ '			<div class="button-close">'
				+ '				<a href="#main">&times;</a>'
				+ '			</div>'
				+ '		</div>'
				+ '		<div class="footer" data-role="footer" data-position="fixed" data-theme="c"><p class="copyright"><span>&copy; 2013 - Rodovi&aacute;ria de Goi&acirc;nia</span><img src="img/logo-tdh.png" alt="TDH Websites" /></p></div>'
				+ '	</div>';
		}
		
		return html;
	},
	initialize: function() {
		var self = this;
		
		/** Verifica se o usuario esta logado **/
		if(self.users.logged()) {
			/**
			 * DIALOGS
			 */
			/** nova pesquisa **/
			$('body').on('click', '#new-search', function() {
				if(self.groups.getStatus() == 'false' || self.groups.getStatus() == null) {
					$('body').append(self.dialogGroup());
				} else {
					navigator.notification.alert("Por favor aguarde a sincronizacao terminar para iniciar a pesquisa!", function() {}, 'Alerta!');
				}
			});
			
			/** sincronizar perguntas **/
			$('body').on('click', '#sync-questions', function() {
				if(self.groups.getStatus() == 'false' || self.groups.getStatus() == null) {
					$('body').append(self.dialogSyncQuestions());
				} else {
					navigator.notification.alert("Por favor aguarde uma sincronizacao terminar para iniciar outra!", function() {}, 'Alerta!');
				}
			});
			
			/** sincronizar pesquisas **/
			$('body').on('click', '#sync-searches', function() {
				if(self.groups.getStatus() == 'false' || self.groups.getStatus() == null) {
					$('body').append(self.dialogSyncSearches());
				} else {
					navigator.notification.alert("Por favor aguarde uma sincronizacao terminar para iniciar outra!", function() {}, 'Alerta!');
				}
			});
			
			/** sair **/
			$('body').on('click', '#exit', function() {
				if(self.groups.getStatus() == 'false' || self.groups.getStatus() == null) {
					$('body').append(self.dialogLogout());
				} else {
					navigator.notification.alert("Por favor aguarde a sincronizacao terminar para sair da aplicacao!", function() {}, 'Alerta!');
				}
			});
			
			/** sair sim **/
			$('body').on('click', '#dialog-logout .logout', function() {
				self.users.clear();
				navigator.app.exitApp();
			});
			
			/** sair sim **/
			$('body').on('click', '#dialog-logout .close', function() {
				navigator.app.exitApp();
			});
			
			/**
			 * SINCRONIZAÇÕES
			 */
			/** Perguntas **/
			$('body').on('click', '#dialog-questions .sync', function() {
				self.groups.sync(self.users.get().id, self.users.getToken());
				
				history.replaceState( {} , $(this).attr('href'), $(this).attr('href') );
			});
			
			/** Pesquisas **/
			$('body').on('click', '#dialog-searches .sync', function() {
				self.searches.sync(self.users.get().id, self.users.getToken());
				
				history.replaceState( {} , $(this).attr('href'), $(this).attr('href') );
			});
			
			/**
			 * PAGINAS
			 */
			/** Carrega Paginas Grupos **/
			$('body').on('click', '#groups a', function() {
				$('body').append(self.pagesGroup( $(this).data('groupid') ));
				
				history.replaceState( {} , $(this).attr('href'), $(this).attr('href') );
			});
			
			/** Digitar Nome **/
			$('body').on('keyup', '.group-text-question', function() {
				$(this).parents('.content').find('.group-button-question').data('value', $(this).val());
			});
			
			/** Proxima Pagina **/
			$('body').on('click', '.group-button-question', function() {
				if($(this).data('key') == 'nome') {
					self.search.set($(this).data('key'), $(this).data('value'));
				} else if($(this).data('key') == 'concluir') {
					var resposta = {
							grupo: $(this).data('groupid'),
							pergunta: $(this).data('questionid'),
							tipo: $(this).data('typeid'),
							opcao: $(this).data('optionid'),
							criado_por: parseInt(self.users.get().id),
							criado_em: (new Date()).format('yyyy-mm-dd')
					};
					
					self.search.set($(this).data('questionid'), resposta);
					
					$('body').append(self.pageThanks());
					
					if(self.search.get()) {
						$('.group-text-question').val(' ');
						self.searches.set(self.search.get());
						self.search.clear();
					}
				} else {
					var resposta = {
							grupo: $(this).data('groupid'),
							pergunta: $(this).data('questionid'),
							tipo: $(this).data('typeid'),
							opcao: $(this).data('optionid'),
							criado_por: parseInt(self.users.get().id),
							criado_em: (new Date()).format('yyyy-mm-dd')
					};
					
					self.search.set($(this).data('questionid'), resposta);
				}
				
				history.replaceState( {} , $(this).attr('href'), $(this).attr('href') );
			});
			
			/** Concluir Pesquisa **/
			$('body').on('click', '.group-button-conclude, .group-button-conclude-new', function() {
				$('body').append(self.pageThanks());
				
				if(self.search.get()) {
					$('.group-text-question').val(' ');
					self.searches.set(self.search.get());
					self.search.clear();
				}
				
				history.replaceState( {} , $(this).attr('href'), $(this).attr('href') );
			});
		} else {
			/**
			 * Pagina de login
			 */
			$('body').append(self.pageLogin());
			
			/**
			 * Submeter o formulario
			 */
			$('body').on('submit', '#login .form', function() {
				self.users.auth($(this).find('#login').val(), $(this).find('#password').val())
				
				return false;
			});
			
			/**
			 * Redireciona para pagina de login
			 */
			history.replaceState( {} , '#login', '#login' );
		}
	}
};

function onConfirmCancelSearch(button) {
	if(button == 1) {
		app.search.clear();
		window.location.replace('index.html');
	}
}

//Wait for device API libraries to load
function onLoad() {
    document.addEventListener("deviceready", onDeviceReady, false);
}

// device APIs are available
function onDeviceReady() {
    // Register the event listener
    document.addEventListener("backbutton", onBackKeyDown, false);
}

// Handle the back button
function onBackKeyDown() {
	if(app.groups.getStatus() == 'false' || app.groups.getStatus() == null) {
		var hash = window.location.hash;
		if(hash.search(/#group-/) != -1) {
			// var test = confirm('Tem certeza que deseja cancelar a pesquisa!');
			navigator.notification.confirm('Tem certeza que deseja cancelar a pesquisa?', onConfirmCancelSearch, 'Sair', 'OK, Cancelar');
		} else if(hash.search(/#login/) != -1 || location.hash == '') {
			navigator.app.exitApp();
		} else {
			history.go(-1);
			navigator.app.backHistory();
		}
	} else {
		navigator.notification.alert("Desculpe nao e possivel finalizar a aplicacao!\nAguarde a sincronizacao terminar!", function() {}, 'Alerta!');
	}
}

onLoad();