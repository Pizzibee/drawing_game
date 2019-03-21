import javax.servlet.http.HttpServlet;

import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.servlet.DefaultServlet;
import org.eclipse.jetty.servlet.ServletHolder;
import org.eclipse.jetty.webapp.WebAppContext;


public class Main {

	public static void main(String[] args) throws Exception {
		Server server = new Server(8080); // serveur sur port 8080
		WebAppContext context = new WebAppContext(); // objet de configuration
		HttpServlet ms=new MaServlet(); // MaServlet réponds à une requête
		// il faut définir cette classe !
		context.addServlet(new ServletHolder(ms), "/dessin");
		// ms traîtera les requêtes sur le chemin /chargerClasse
		context.setResourceBase("www"); // répertoire des fichiers html etc
		// chemin relatif => à la racine du projet
		HttpServlet ds=new DefaultServlet(); // ce servlet est founi par Jetty
		// il répond aux requêtes pour obtenir les fichiers html etc
		context.addServlet(new ServletHolder(ds), "/");
		// ds servira les fichiers pour tous les chemins.
		// Comme il est ajouté après ms,
		// sur le chemin /masv/ : ms est prioritaire.
		server.setHandler(context); // donne la configuration au serveur
		server.start(); // démarrage
	}

}
