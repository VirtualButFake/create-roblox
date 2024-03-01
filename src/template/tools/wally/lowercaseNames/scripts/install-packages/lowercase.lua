local fs = require("@lune/fs")

return function(fileName)
	fs.move("./Packages", "./packages", true)
end
