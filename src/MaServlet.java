import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.auth0.jwt.JWTSigner;
import com.owlike.genson.Genson;

public class MaServlet extends HttpServlet {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	private static String SECRET = "azertyuiopqsdfghjklmwxcvbn"; //peut être n'importe quoi
	
	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		String action = req.getParameter("action");
		switch (action) {
		case "signIn":
			String usernameIn = req.getParameter("username");
			String passwordIn = req.getParameter("password");
			String contentIn = new String(Files.readAllBytes(Paths.get("json/comptes.json")));
			@SuppressWarnings("unchecked")
			Map<String,String> comptesIn = new Genson().deserialize(contentIn, Map.class);
			if (comptesIn.containsKey(usernameIn) && comptesIn.get(usernameIn).equals(passwordIn)) {
				Map<String, Object> claims = new HashMap<String, Object>();
				claims.put("username", usernameIn);
				claims.put("ip", req.getRemoteAddr());
				String ltoken = new JWTSigner(SECRET).sign(claims);
				Cookie cookie = new Cookie("user", ltoken);
				cookie.setPath("/");
				cookie.setMaxAge(60 * 60 * 24 * 365); // 1ans
				resp.addCookie(cookie);
				resp.getWriter().write("true");
			}else {
				resp.getWriter().write("false");
			}
			break;
		case "signUp":
			String usernameUp = req.getParameter("username");
			String passwordUp = req.getParameter("password");
			try {
				String contentUp;
				contentUp = new String(Files.readAllBytes(Paths.get("json/comptes.json")));
				@SuppressWarnings("unchecked")
				Map<String,String> comptesUp = new Genson().deserialize(contentUp, Map.class);
				
				if(!comptesUp.containsKey(usernameUp)) { //pour éviter les doublons
					comptesUp.put(usernameUp, passwordUp);
					String json = new Genson().serialize(comptesUp);
					FileOutputStream writer = new FileOutputStream("json/comptes.json");
					writer.write((json).getBytes());
					writer.close();
					resp.getWriter().write("true");
				}else {
					resp.getWriter().write("false");
				}
				
			} catch (IOException e) {
				e.printStackTrace();
				resp.getWriter().write("false");
			}
			break;
		case "saveDessin":
			String oldJSON =  new String(Files.readAllBytes(Paths.get("json/dessins.json")));
			@SuppressWarnings("unchecked") 
			Map<Integer, String> dessins = new Genson().deserialize(oldJSON, Map.class);
			dessins.put(dessins.size(), req.getParameter("dessin"));
			String newJSON = new Genson().serialize(dessins);
			FileOutputStream writer = new FileOutputStream("json/dessins.json");
			writer.write(newJSON.getBytes());
			writer.close();
			break;
		case "getDessins":
			String allDessins =  new String(Files.readAllBytes(Paths.get("json/dessins.json")));
			resp.getWriter().write(allDessins);
			break;
		case "getNbrDessin":
			String dessinContentStr =  new String(Files.readAllBytes(Paths.get("json/dessins.json")));
			@SuppressWarnings("unchecked") 
			Map<Integer, String> mapDessins = new Genson().deserialize(dessinContentStr, Map.class);
			resp.getWriter().write(String.valueOf(mapDessins.size()));
			break;
		default:
			break;
		}
	}
}
